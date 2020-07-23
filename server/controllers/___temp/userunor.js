const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const dateFormat = require('dateformat');
var config = require('../config/config.json');
const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

const moment    = require('moment');
var env         = process.env.NODE_ENV || 'development';
var configEnv    = require(__dirname + '/../config/config.json')[env];
var config = require('../config/config.json');
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const promise   = require('promise');

const modelUserUnorHeader = require('../models').user_unor_header;
const modelUserUnorDetail = require('../models').user_unor_detail;

module.exports = {

    /*Unor Header*/
    listHeader(req,res){
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

                    return modelUserUnorHeader.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    unor_header_name:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    code:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                }
                            ]
                        }
                        
                    })
                    .then( data => {
                        modelUserUnorHeader.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        unor_header_name:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        code:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ]
                            },                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( unorHeader => {

                            for( var i = 0; i < unorHeader.length; i++ ){

                                libUtil.getEncrypted( (unorHeader[i].id).toString(), function(ecnryptedData){                                    
                                    //libUtil.getEncrypted( (angkaKredit[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDelete = '';
                                        var navigationDetail = '';

                                        var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            unorHeader[i].code + config.frontParam.separatorData +  
                                                            unorHeader[i].unor_header_name;
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-userunor-header-form" class="btn bg-navy" name="link-edit-unorheader" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-userunorheader" class="btn bg-red" name="link-delete-unorheader" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';
                                        navigationDetail = '<a href="' + (config.frontParam.baseUrl + '/userunor/detail/' + ecnryptedData) + '" class="btn bg-blue"><i class="glyphicon glyphicon-th-list"></i></a>';

                                        joData.push({
                                            index: (i+1),
                                            name: unorHeader[i].unor_header_name,
                                            code: unorHeader[i].code,
                                            effective_date: unorHeader[i].efective_date,
                                            created_at: unorHeader[i].createdAt,
                                            updated_at: unorHeader[i].updatedAt,
                                            navigation: (navigationEdit + '&nbsp;' + navigationDelete + '&nbsp;' + navigationDetail)
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

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        } );                        

                    } );
                });
                                     
                
            }
        });
    },    

    saveHeader( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                
                if( req.body.act == 'add' ){
                    libUtil.getCurrDateTime(function(currTime){
                        return modelUserUnorHeader
                            .findOrCreate({
                                where:{
                                    code: req.body.code
                                },
                                defaults:{
                                    unor_header_name: req.body.name,
                                    createdAt: currTime,
                                    //efective_date: req.body.effective_date
                                }                                    
                            })
                            .spread( ( unorHeader, created ) => {
                                if( created ){
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Unor header berhasil disimpan."
                                    });
                                }else{
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Kode Unor Header tidak dapat duplikat."
                                    });
                                }

                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            } )

                    });
                }else if( req.body.act == 'edit' ){
                    libUtil.getDecrypted( req.body.id, function( decryptedId ){       
                        libUtil.getCurrDateTime(function(currTime){
                            return modelUserUnorHeader
                                .update({
                                    unor_header_name: req.body.name,
                                    code: req.body.code,
                                    //efective_date: req.body.effective_date,
                                    updatedAt: currTime
                                },{
                                    where:{
                                        id: decryptedId 
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data Unor Header berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    } );
                }
                
            }
        });
    },

    deleteHeader( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				var id = req.body.id;
                libUtil.getDecrypted( req.body.id, function( decryptedId ){
                    return modelUserUnorDetail.findAll({
                        where:{
                            unor_header_id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data.length == 0 ){

                            modelUserUnorHeader.destroy({
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
                                'status_msg': 'There is Unor Detail inside this data and you can\'t delete it.'
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }
                    } )
                });
			}

		});

    },

    detailHeader(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var xId = req.query.id;

                var joData = [];
                
                libUtil.getDecrypted( xId, function(decryptedId){

                    var strSql;
                    var filterId = "";
                    var objJSONWhere = {};

                    if( req.query.id != "" ){
                        filterId = " AND ( id = :id ) ";
                        objJSONWhere.id = decryptedId
                    }

                    strSql = " SELECT id, unor_header_name " +                             
                             " FROM user_unor_header " +  
                             " WHERE (1=1) " + filterId;

                    return sequelize.query( strSql, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( data => {
                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "id": data[0].id,
                            "unor_header_name": data[0].unor_header_name
                        });
                    
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);
                    } )
                    
                });
                                     
                
            }
        });
    },
    
    /** Unor Detail */
    listDetail(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var xKeyword = req.query.keyword;
				var xOffset = parseInt(req.query.offset);
				var xLimit = parseInt(req.query.limit);
                var xDraw = req.query.draw;
                var xId = req.query.id;

                var joData = [];
                
                libUtil.getDecrypted( xId, function(decryptedId){

                    var strSql;
                    var strSqlCount;
                    var filterKeyword = "";
                    var filterId = "";
                    var objJSONWhere = {};
                    var navigationEdit = "";
                    var navigationDelete = "";

                    if( req.query.keyword != "" ){
                        filterKeyword = " AND ( ud.no_sk LIKE '%" + xKeyword + "%' OR u.name LIKE '%" + xKeyword + "%' OR un.name LIKE '%" + xKeyword + "%' ) ";
                    }

                    if( req.query.id != "" ){
                        filterId = " AND ( ud.unor_header_id = :id ) ";
                        objJSONWhere.id = decryptedId
                    }

                    strSql = " SELECT ud.id, ud.unor_header_id, un.id AS unor_id,u.id AS user_id," +
                             "        (CASE WHEN un.unor_type = 1 THEN CONCAT('Kepala ',un.name) ELSE un.name END) AS unor_name," +
                             "        u.name AS nama_pegawai," + 
                             "        ud.no_sk," + 
                             "        DATE_FORMAT(ud.tgl_sk,'%d-%m-%Y') AS tgl_sk," + 
                             "        DATE_FORMAT(ud.tgl_efektif,'%d-%m-%Y') AS tgl_efektif," + 
                             "        ud.file_sk," + 
                             "        DATE_FORMAT(ud.created_at,'%d-%m-%Y %H:%i:%s') AS created_at" +                             
                             " FROM user_unor_detail ud INNER JOIN users u " + 
                             "      ON ud.user_id = u.id " +
                             "          INNER JOIN db_unor un ON ud.unor_id = un.id " +  
                             " WHERE (1=1) " + filterKeyword + filterId + 
                             " LIMIT " + xOffset + "," + xLimit;

                    strSqlCount = " SELECT COUNT(0) AS num_row " + 
                                  " FROM user_unor_detail ud INNER JOIN users u " + 
                                  "     ON ud.user_id = u.id " + 
                                  "         INNER JOIN db_unor un ON ud.unor_id = un.id WHERE (1=1) " + filterKeyword + filterId;

                    return sequelize.query( strSqlCount, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( data => {
                        sequelize.query( strSql, {
                            replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                        } )
                        .then( dataUnorDetail => {
                            for( var i = 0; i < dataUnorDetail.length; i++ ){
                                libUtil.getEncrypted( ( dataUnorDetail[i].id ).toString(), function(encryptedId){
                                    libUtil.getEncrypted( ( dataUnorDetail[i].unor_header_id ).toString(), function(encryptedHeaderId){
                                        
                                        var dataForEdit = encryptedId + config.frontParam.separatorData + 
                                                            encryptedHeaderId + config.frontParam.separatorData +  
                                                            dataUnorDetail[i].unor_id + config.frontParam.separatorData +                                                              
                                                            dataUnorDetail[i].user_id + config.frontParam.separatorData + 
                                                            dataUnorDetail[i].tgl_efektif;

                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-userunor-detail-form" class="btn bg-navy" name="link-edit-unordetail" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-userunordetail" class="btn bg-red" name="link-delete-unordetail" data="' + encryptedId + '"><i class="glyphicon glyphicon-remove"></i></a>';
                                        
                                        joData.push({
                                            index: (i+1),
                                            id: encryptedId,
                                            header_id: encryptedHeaderId,
                                            unor_name: dataUnorDetail[i].unor_name,
                                            name: dataUnorDetail[i].nama_pegawai,
                                            no_sk: dataUnorDetail[i].no_sk,
                                            tgl_sk: dataUnorDetail[i].tgl_sk,
                                            tgl_efektif: dataUnorDetail[i].tgl_efektif,
                                            file_sk: dataUnorDetail[i].file_sk,
                                            created_at: dataUnorDetail[i].created_at,
                                            navigation:navigationEdit + '&nbsp;' + navigationDelete
                                        });
                                    })
                                } )
                            }

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": joData,
                                "recordsTotal": data[0].num_row,
                                "recordsFiltered": data[0].num_row,
                                "draw": xDraw
                            });

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        } )
                    } )
                    
                });
                                     
                
            }
        });
    },

    saveDetail( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var xTglSk = "";
                if( req.body.tgl_sk != null && req.body.tgl_sk != "" ){
                    xTglSk = libUtil.parseToFormattedDate( req.body.tgl_sk );
                }

                var xTglEfektif = "";
                if( req.body.effective_date != null && req.body.effective_date != "" ){
                    xTglEfektif = libUtil.parseToFormattedDate( req.body.effective_date );
                }

                if( req.body.act == 'add' ){
                    libUtil.getCurrDateTime(function(currTime){
                        libUtil.getDecrypted( req.body.unor_header_id, function(decryptedId){
                            return modelUserUnorDetail
                                .findOrCreate({
                                    where:{
                                        unor_header_id: decryptedId,
                                        unor_id: req.body.unor_id,
                                        user_id: req.body.user_id
                                    },
                                    defaults:{
                                        no_sk: req.body.no_sk,
                                        //tgl_sk: '',
                                        //file_sk: '',
                                        tgl_efektif: xTglEfektif,
                                        createdAt: currTime
                                    }                                    
                                })
                                .spread( ( unorHeader, created ) => {
                                    if( created ){
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Unor detail berhasil disimpan."
                                        });
                                    }else{
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Unor detail tidak dapat duplikat."
                                        });
                                    }

                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
                        });

                    });
                }else if( req.body.act == 'edit' ){
                    libUtil.getDecrypted( req.body.id, function( decryptedId ){    
                        libUtil.getDecrypted( req.body.unor_header_id, function( decryptedHeaderId ){       
                            libUtil.getCurrDateTime(function(currTime){
                                return modelUserUnorDetail
                                    .update({
                                        unor_id: req.body.unor_id,
                                        user_id: req.body.user_id,
                                        tgl_efektif: xTglEfektif
                                    },{
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Peta Jabatan berhasil disimpan."
                                        });
                
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    } );
        
                            });
                        });
                    } );
                }
                
            }
        });
    },

    deleteDetail( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				var id = req.body.id;
                libUtil.getDecrypted( req.body.id, function( decryptedId ){
                    return modelUserUnorDetail.destroy({
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
                });
			}

		});

    },
}