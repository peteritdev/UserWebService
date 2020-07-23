const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelCLTN = require('../models').user_history_cltn;
const modelJenisCLTN = require('../models').db_jenis_cltn;

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

                    return modelCLTN.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$jenisCltn.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    no_sk_cltn:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    no_bkn:{
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
                                model: modelJenisCLTN,
                                as: 'jenisCltn'
                            }
                        ]
                    })
                    .then( data => {
                        modelCLTN.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        '$jenisCltn.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        no_sk_cltn:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        no_bkn:{
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
                                    model: modelJenisCLTN,
                                    as: 'jenisCltn'
                                }
                            ],                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( cltn => {

                            for( var i = 0; i < cltn.length; i++ ){

                                libUtil.getEncrypted( (cltn[i].id).toString(), function(ecnryptedData){                                    
                                    libUtil.getEncrypted( (cltn[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';
                                        var navigationDelete = '';

                                        var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            cltn[i].jenis_cltn + config.frontParam.separatorData + 
                                                            cltn[i].no_sk_cltn + config.frontParam.separatorData + 
                                                            ( cltn[i].tgl_skep !== null && cltn[i].tgl_skep !== "" && cltn[i].tgl_skep !== "0000-00-00" ? dateFormat(cltn[i].tgl_skep, "dd-mm-yyyy") : "") + config.frontParam.separatorData +
                                                            ( cltn[i].tgl_awal !== null && cltn[i].tgl_awal !== "" && cltn[i].tgl_awal !== "0000-00-00" ? dateFormat(cltn[i].tgl_awal, "dd-mm-yyyy") : "") + config.frontParam.separatorData +  
                                                            ( cltn[i].tgl_akhir !== null && cltn[i].tgl_akhir !== "" && cltn[i].tgl_akhir !== "0000-00-00" ? dateFormat(cltn[i].tgl_akhir, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                            ( cltn[i].tgl_aktif !== null && cltn[i].tgl_aktif !== "" && cltn[i].tgl_aktif !== "0000-00-00" ? dateFormat(cltn[i].tgl_aktif, "dd-mm-yyyy") : "") + config.frontParam.separatorData +  
                                                            cltn[i].no_bkn + config.frontParam.separatorData + 
                                                            ( cltn[i].tgl_bkn !== null && cltn[i].tgl_bkn !== "" && cltn[i].tgl_bkn !== "0000-00-00" ? dateFormat(cltn[i].tgl_bkn, "dd-mm-yyyy") : "");
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-cltn" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-cltn" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-cltn" class="btn bg-red" name="link-delete-cltn" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';

                                        joData.push({
                                            index: (i+1),
                                            jenis_cltn: {
                                                id: ( cltn[i].jenisCltn !== null ? cltn[i].jenisCltn.id : 0 ),
                                                name: ( cltn[i].jenisCltn !== null ? cltn[i].jenisCltn.name : "" )
                                            },
                                            no_sk_cltn: cltn[i].no_sk_cltn,
                                            tgl_skep: ( cltn[i].tgl_skep !== null && cltn[i].tgl_skep !== "" && cltn[i].tgl_skep !== "0000-00-00" ? dateFormat(cltn[i].tgl_skep, "dd-mm-yyyy") : ""),
                                            tgl_awal: ( cltn[i].tgl_awal !== null && cltn[i].tgl_awal !== "" && cltn[i].tgl_awal !== "0000-00-00" ? dateFormat(cltn[i].tgl_awal, "dd-mm-yyyy") : ""),
                                            tgl_akhir: ( cltn[i].tgl_akhir !== null && cltn[i].tgl_akhir !== "" && cltn[i].tgl_akhir !== "0000-00-00" ? dateFormat(cltn[i].tgl_akhir, "dd-mm-yyyy") : ""), 
                                            tgl_aktif: ( cltn[i].tgl_aktif !== null && cltn[i].tgl_aktif !== "" && cltn[i].tgl_aktif !== "0000-00-00" ? dateFormat(cltn[i].tgl_aktif, "dd-mm-yyyy") : ""),
                                            no_bkn: cltn[i].no_bkn,
                                            tgl_bkn: ( cltn[i].tgl_bkn !== null && cltn[i].tgl_bkn !== "" && cltn[i].tgl_bkn !== "0000-00-00" ? dateFormat(cltn[i].tgl_bkn, "dd-mm-yyyy") : ""),
                                            navigation: ( navigationEdit + '&nbsp;' + navigationDelete )
                                        });

                                    });

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

                    var xTglSKEP = "";
                    var xTglAwal = "";
                    var xTglAkhir = "";
                    var xTglAktif = "";
                    var xTglBKN = "";
                    if( req.body.tgl_skep != null && req.body.tgl_skep != "" ){
                        xTglSKEP = libUtil.parseToFormattedDate( req.body.tgl_skep );
                    }
                    if( req.body.tgl_awal != null && req.body.tgl_awal != "" ){
                        xTglAwal = libUtil.parseToFormattedDate( req.body.tgl_awal );
                    }
                    if( req.body.tgl_akhir != null && req.body.tgl_akhir != "" ){
                        xTglAkhir = libUtil.parseToFormattedDate( req.body.tgl_akhir );
                    }
                    if( req.body.tgl_aktif != null && req.body.tgl_aktif != "" ){
                        xTglAktif = libUtil.parseToFormattedDate( req.body.tgl_aktif );
                    }
                    if( req.body.tgl_bkn != null && req.body.tgl_bkn != "" ){
                        xTglBKN = libUtil.parseToFormattedDate( req.body.tgl_bkn );
                    }

                    if( req.body.act == 'add' ){
                        libUtil.getCurrDateTime(function(currTime){
                            return modelCLTN
                                .create({
                                    user_id: decryptedUserId,
                                    jenis_cltn: req.body.jenis_cltn_id,
                                    no_sk_cltn: req.body.no_sk_cltn,
                                    tgl_skep: ( xTglSKEP == "" ? null : xTglSKEP ),
                                    tgl_awal: ( xTglAwal == "" ? null : xTglAwal ),
                                    tgl_akhir: ( xTglAkhir == "" ? null : xTglAkhir ),
                                    tgl_aktif: ( xTglAktif == "" ? null : xTglAktif ),
                                    no_bkn: req.body.no_bkn,
                                    tgl_bkn: ( xTglBKN == "" ? null : xTglBKN ),                               
                                    createdAt: currTime
                                })
                                .then( pwk => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data CLTN berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    }else if( req.body.act == 'edit' ){
                        libUtil.getDecrypted( req.body.cltn_id, function( decryptedId ){       
                            libUtil.getCurrDateTime(function(currTime){
                                return modelCLTN
                                    .update({
                                        jenis_cltn: req.body.jenis_cltn_id,
                                        no_sk_cltn: req.body.no_sk_cltn,
                                        tgl_skep: ( xTglSKEP == "" ? null : xTglSKEP ),
                                        tgl_awal: ( xTglAwal == "" ? null : xTglAwal ),
                                        tgl_akhir: ( xTglAkhir == "" ? null : xTglAkhir ),
                                        tgl_aktif: ( xTglAktif == "" ? null : xTglAktif ),
                                        no_bkn: req.body.no_bkn,
                                        tgl_bkn: ( xTglBKN == "" ? null : xTglBKN ),  
                                        updatedAt: currTime
                                    },{
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data CLTN berhasil disimpan."
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

                    return modelCLTN.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){

                            modelCLTN.destroy({
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

	}
}