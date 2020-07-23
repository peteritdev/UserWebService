const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelPWK = require('../models').user_history_pwk;
const modelKPPN = require('../models').db_kppn;
const modelSatuanKerja = require('../models').db_satuan_kerja;
const modelProvince = require('../models').db_provinsi;
const modelUnor = require('../models').db_unor;

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

                    return modelPWK.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$kppn.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$satuanKerja.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$province.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$unor.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    no_sk:{
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
                                model: modelKPPN,
                                as: 'kppn'
                            },
                            {
                                model: modelSatuanKerja,
                                as: 'satuanKerja'
                            },
                            {
                                model: modelUnor,
                                as: 'unor'
                            },
                            {
                                model: modelProvince,
                                as: 'province'
                            }
                        ]
                    })
                    .then( data => {
                        modelPWK.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        '$kppn.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$satuanKerja.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$province.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$unor.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        no_sk:{
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
                                    model: modelKPPN,
                                    as: 'kppn'
                                },
                                {
                                    model: modelSatuanKerja,
                                    as: 'satuanKerja'
                                },
                                {
                                    model: modelUnor,
                                    as: 'unor'
                                },
                                {
                                    model: modelProvince,
                                    as: 'province'
                                }
                            ],                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( pwk => {

                            for( var i = 0; i < pwk.length; i++ ){

                                libUtil.getEncrypted( (pwk[i].id).toString(), function(ecnryptedData){                                    
                                    libUtil.getEncrypted( (pwk[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';
                                        var navigationDelete = '';

                                        var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            pwk[i].kppn_id + config.frontParam.separatorData + 
                                                            pwk[i].satuan_kerja_id + config.frontParam.separatorData +
                                                            pwk[i].lokasi_id + config.frontParam.separatorData + 
                                                            pwk[i].unor_id + config.frontParam.separatorData + 
                                                            pwk[i].no_sk + config.frontParam.separatorData + 
                                                            ( pwk[i].tgl_sk !== null && pwk[i].tgl_sk !== "" && pwk[i].tgl_sk !== "0000-00-00" ? dateFormat(pwk[i].tgl_sk, "dd-mm-yyyy") : "") + config.frontParam.separatorData +  
                                                            ( pwk[i].tmt_pemindahan !== null && pwk[i].tmt_pemindahan !== "" && pwk[i].tmt_pemindahan !== "0000-00-00" ? dateFormat(pwk[i].tmt_pemindahan, "dd-mm-yyyy") : "");
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-pwk" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-pwk" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-pwk" class="btn bg-red" name="link-delete-pwk" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';

                                        joData.push({
                                            index: (i+1),
                                            kppn: {
                                                id: ( pwk[i].kppn !== null ? pwk[i].kppn.id : 0 ),
                                                name: ( pwk[i].kppn !== null ? pwk[i].kppn.name : "" )
                                            },
                                            satuan_kerja: {
                                                id: ( pwk[i].satuanKerja !== null ? pwk[i].satuanKerja.id : 0 ),
                                                name: ( pwk[i].satuanKerja !== null ? pwk[i].satuanKerja.name : "" )
                                            },
                                            lokasi: {
                                                id: ( pwk[i].province !== null ? pwk[i].province.id : 0 ),
                                                name: ( pwk[i].province !== null ? pwk[i].province.name : "" )
                                            },
                                            unor: {
                                                id: ( pwk[i].unor !== null ? pwk[i].unor.id : 0 ),
                                                name: ( pwk[i].unor !== null ? pwk[i].unor.name : "" )
                                            },
                                            no_sk: pwk[i].no_sk,
                                            tgl_sk:  ( pwk[i].tgl_sk !== null && pwk[i].tgl_sk !== "" && pwk[i].tgl_sk !== "0000-00-00" ? dateFormat(pwk[i].tgl_sk, "dd-mm-yyyy") : ""),
                                            tmt_pemindahan:  ( pwk[i].tmt_pemindahan !== null && pwk[i].tmt_pemindahan !== "" && pwk[i].tmt_pemindahan !== "0000-00-00" ? dateFormat(pwk[i].tmt_pemindahan, "dd-mm-yyyy") : ""),
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

                    var xTglSk = "";
                    var xTmtPemindahan = "";
                    if( req.body.tgl_sk != null && req.body.tgl_sk != "" ){
                        xTglSk = libUtil.parseToFormattedDate( req.body.tgl_sk );
                    }
                    if( req.body.tmt_pemindahan != null && req.body.tmt_pemindahan != "" ){
                        xTmtPemindahan = libUtil.parseToFormattedDate( req.body.tmt_pemindahan );
                    }

                    if( req.body.act == 'add' ){
                        libUtil.getCurrDateTime(function(currTime){
                            return modelPWK
                                .create({
                                    user_id: decryptedUserId,
                                    kppn_id: req.body.kppn_id,
                                    satuan_kerja_id: req.body.satuan_kerja_id,
                                    lokasi_id: req.body.lokasi_id,
                                    unor_id: req.body.unor_id,
                                    no_sk: req.body.no_sk,                                    
                                    tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                    tmt_pemindahan: ( xTmtPemindahan == "" ? null : xTmtPemindahan ),                               
                                    createdAt: currTime
                                })
                                .then( pwk => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data PWK berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    }else if( req.body.act == 'edit' ){
                        libUtil.getDecrypted( req.body.pwk_id, function( decryptedId ){       
                            libUtil.getCurrDateTime(function(currTime){
                                return modelPWK
                                    .update({
                                        kppn_id: req.body.kppn_id,
                                        satuan_kerja_id: req.body.satuan_kerja_id,
                                        lokasi_id: req.body.lokasi_id,
                                        unor_id: req.body.unor_id,
                                        no_sk: req.body.no_sk,                                    
                                        tgl_sk: ( xTglSk == "" ? null : xTglSk ),
                                        tmt_pemindahan: ( xTmtPemindahan == "" ? null : xTmtPemindahan ),  
                                        updatedAt: currTime
                                    },{
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data PWK berhasil disimpan."
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

                    return modelPWK.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){

                            modelPWK.destroy({
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