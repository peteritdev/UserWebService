const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelHukumanDisiplin = require('../models').user_history_hukum_disiplin;
const modelJenisHukuman = require('../models').db_jenis_hukuman;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    list(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var keyword = req.query.keyword;
				var offset = parseInt(req.query.offset);
				var limit = parseInt(req.query.limit);
                var draw = req.query.draw;
                var id = req.query.id;

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    return modelHukumanDisiplin.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    no_sk_hd:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    no_pp:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    alasan_hukuman:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                }
                            ],
                            [Op.and]:[{
                                "user_id":decryptedId
                            }]
                        },
                        include:[
                            {
                                model: modelJenisHukuman,
                                as: 'jenisHukuman'
                            }
                        ]
                    })
                    .then( data => {
                        modelHukumanDisiplin.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        no_sk_hd:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        no_pp:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        alasan_hukuman:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ],
                                [Op.and]:[{
                                    "user_id":decryptedId
                                }]
                            },
                            include:[
                                {
                                    model: modelJenisHukuman,
                                    as: 'jenisHukuman'
                                }
                            ],                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( hukdis => {

                            for( var i = 0; i < hukdis.length; i++ ){

                                libUtil.getEncrypted( (hukdis[i].id).toString(), function(ecnryptedData){                                    
                                    //libUtil.getEncrypted( (hukdis[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';   
                                        var navigationDelete = '';
                                        var linkUploadSK = '<a href="#" name="link-modal-upload-sk-hukdis" class="btn btn-warning btn-md" data-toggle="modal" data-target="#modal-upload-sk-hukdis" data-edit="' + ecnryptedData + '"><i class="glyphicon glyphicon-upload"></i></a>';
                                        var columnSKVal = '';

                                        // Version 1: 
                                        /*var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            hukdis[i].jenis_hukuman_id + config.frontParam.separatorData + 
                                                            hukdis[i].no_sk_hd + config.frontParam.separatorData + 
                                                            ( hukdis[i].tgl_sk_hd !== null && hukdis[i].tgl_sk_hd !== "" && hukdis[i].tgl_sk_hd !== "0000-00-00" ? dateFormat(hukdis[i].tgl_sk_hd, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                            ( hukdis[i].tmt_hd !== null && hukdis[i].tmt_hd !== "" && hukdis[i].tmt_hd !== "0000-00-00" ? dateFormat(hukdis[i].tmt_hd, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                            ( hukdis[i].masa_hukuman_tahun !== null ? hukdis[i].masa_hukuman_tahun : 0 ) + config.frontParam.separatorData + 
                                                            ( hukdis[i].masa_hukuman_bulan !== null ? hukdis[i].masa_hukuman_bulan : 0 ) + config.frontParam.separatorData + 
                                                            hukdis[i].no_pp + config.frontParam.separatorData + 
                                                            hukdis[i].alasan_hukuman + config.frontParam.separatorData + 
                                                            hukdis[i].keterangan;
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-hukdis" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-hukdis" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-hukdis" class="btn bg-red" name="link-delete-hukdis" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';
 
                                        linkUploadSK = '<a href="#" name="link-modal-upload-sk-hukdis" class="btn btn-warning btn-md" data-toggle="modal" data-target="#modal-upload-sk-hukdis" data-edit="' + ecnryptedData + '"><i class="glyphicon glyphicon-upload"></i></button>';
                                        if( hukdis[i].file_sk != '' && hukdis[i].file_sk != null ){
                                            linkUploadSK = linkUploadSK + ' <a href="' + config.frontParam.filePath.fileSKHukdis + hukdis[i].file_sk + '" class="btn btn-primary btn-md"><i class="glyphicon glyphicon-download"></i>&nbsp;Download</button>';
                                        }*/

                                        // Version 2 :                                         
                                        if( hukdis[i].file_sk != '' && hukdis[i].file_sk != null ){
                                            columnSKVal = '<a href="' + config.frontParam.filePath.fileSKHukdis + hukdis[i].file_sk + '">' + hukdis[i].no_sk_hd + '</a>';
                                        }else{
                                            columnSKVal = hukdis[i].no_sk_hd
                                        }

                                        joData.push({
                                            index: (i+1),
                                            jenis_hukuman: {
                                                id: ( hukdis[i].jenisHukuman !== null ? hukdis[i].jenisHukuman.id : 0 ),
                                                name: ( hukdis[i].jenisHukuman !== null ? hukdis[i].jenisHukuman.name : "" )
                                            },
                                            no_sk: columnSKVal,
                                            tgl_sk:  ( hukdis[i].tgl_sk !== null && hukdis[i].tgl_sk !== "" && hukdis[i].tgl_sk !== "0000-00-00" ? dateFormat(hukdis[i].tgl_sk, "dd-mm-yyyy") : ""),
                                            tmt_hd:  ( hukdis[i].tmt_hd !== null && hukdis[i].tmt_hd !== "" && hukdis[i].tmt_hd !== "0000-00-00" ? dateFormat(hukdis[i].tmt_hd, "dd-mm-yyyy") : ""),
                                            no_sk_pembatalan: hukdis[i].no_sk_pembatalan,
                                            tgl_sk_pembatalan: ( hukdis[i].tgl_sk_pembatalan !== null && hukdis[i].tgl_sk_pembatalan !== "" && hukdis[i].tgl_sk_pembatalan !== "0000-00-00" ? dateFormat(hukdis[i].tgl_sk_pembatalan, "dd-mm-yyyy") : ""),
                                            navigation: ( navigationEdit + '&nbsp;' + navigationDelete ),
                                            link_upload_sk: linkUploadSK 
                                        });

                                    //});

                                } );

                            }                     
                            
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": joData,
                                "recordsTotal": data.count,
                                "recordsFiltered": data.count,
                                "draw": draw
                            });

                            console.log(">>> HUKDIS DATA : " + joResult);

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        } );                        

                    } );
                });
                                     
                
            }
        });
    },

    save( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                libUtil.getDecrypted( req.body.user_id, function( decryptedUserId ){

                    /*if( req.body.id === '' ){
                        decryptedId = 0;
                    }else{
                        libUtil.getDecrypted( req.body.id, function( decrypted ){
                            decryptedId = decrypted;
                        });
                    }*/                    

                    var xTglSkHd = "";
                    var xTmtHd = "";
                    if( req.body.tgl_sk_hd != null && req.body.tgl_sk_hd != "" ){
                        xTglSkHd = libUtil.parseToFormattedDate( req.body.tgl_sk_hd );
                    }
                    if( req.body.tmt_hd != null && req.body.tmt_hd != "" ){
                        xTmtHd = libUtil.parseToFormattedDate( req.body.tmt_hd );
                    }

                    if( req.body.act == 'add' ){
                        libUtil.getCurrDateTime(function(currTime){
                            return modelHukumanDisiplin
                                .create({
                                    user_id: decryptedUserId,
                                    jenis_hukuman_id: req.body.jenis_hukuman_id,
                                    no_sk_hd: req.body.no_sk_hd,
                                    tgl_sk_hd: ( xTglSkHd == "" ? null : xTglSkHd ),
                                    tmt_hd: ( xTmtHd == "" ? null : xTmtHd ),
                                    masa_hukuman_tahun: req.body.masa_hukuman_tahun,
                                    masa_hukuman_bulan: req.body.masa_hukuman_bulan,
                                    no_pp: req.body.no_pp,
                                    alasan_hukuman: req.body.alasan_hukuman,
                                    keterangan: req.body.keterangan,                                
                                    createdAt: currTime
                                })
                                .then( dp3 => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data Hukdis berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    }else if( req.body.act == 'edit' ){
                        libUtil.getDecrypted( req.body.hukdis_id, function( decryptedId ){       
                            libUtil.getCurrDateTime(function(currTime){
                                return modelHukumanDisiplin
                                    .update({
                                        jenis_hukuman_id: req.body.jenis_hukuman_id,
                                        no_sk_hd: req.body.no_sk_hd,
                                        tgl_sk_hd: ( xTglSkHd == "" ? null : xTglSkHd ),
                                        tmt_hd: ( xTmtHd == "" ? null : xTmtHd ),
                                        masa_hukuman_tahun: req.body.masa_hukuman_tahun,
                                        masa_hukuman_bulan: req.body.masa_hukuman_bulan,
                                        no_pp: req.body.no_pp,
                                        alasan_hukuman: req.body.alasan_hukuman,
                                        keterangan: req.body.keterangan,  
                                        updatedAt: currTime
                                    },{
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data Hukdis berhasil disimpan."
                                        });
                
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    } );
        
                            });
                        } );
                    }
                    
                } );
                
            }
        });
    },

    delete( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				libUtil.getDecrypted( req.body.id, function( decryptedId ){

                    return modelHukumanDisiplin.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){

                            modelHukumanDisiplin.destroy({
                                where: {
                                    id: decryptedId
                                }
                            })
                            .then( dataDelete => {

                                joResult = JSON.stringify({
                                    'status_code': '00',
                                    'status_msg': 'Data successfully deleted'
                                });
                                res.setHeader('Content-Type','application/json');
                                res.status(404).send(joResult);

                            } )
                            
                        }else{
                            joResult = JSON.stringify({
                                'status_code': '-99',
                                'status_msg': 'Data not found.'
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }
                    } );

                });
			}

		});

    },
    
    uploadSK( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getDecrypted( req.body.id, function(decryptedId){                   

					modelHukumanDisiplin.update({
						file_sk: req.body.file_name
					},{
						where:{
							id: decryptedId
						}
					})
					.then( () => {
						joResult = JSON.stringify({
							"status_code": "00",
							"status_msg": "Upload file SK berhasil."
						});
						res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
					} )
					.catch( error => res.status(400).send(error) );
				});
			}
		});
	}
}