const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelProfesi = require('../models').user_history_profesi;
const modelJenisProfesi = require('../models').db_profesi;

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

                    return modelProfesi.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$jenisProfesi.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    penyelenggara:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    tahun_lulus:{
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
                                model: modelJenisProfesi,
                                as: 'jenisProfesi'
                            }
                        ]
                    })
                    .then( data => {
                        modelProfesi.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        '$jenisProfesi.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        penyelenggara:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        tahun_lulus:{
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
                                    model: modelJenisProfesi,
                                    as: 'jenisProfesi'
                                }
                            ],                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( profesi => {

                            for( var i = 0; i < profesi.length; i++ ){

                                libUtil.getEncrypted( (profesi[i].id).toString(), function(ecnryptedData){                                    
                                    libUtil.getEncrypted( (profesi[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';
                                        var navigationDelete = '';

                                        var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            profesi[i].profesi_id + config.frontParam.separatorData + 
                                                            profesi[i].penyelenggara + config.frontParam.separatorData +
                                                            profesi[i].tahun_lulus;
                                        status = '<small class="label pull-left bg-green">Aktif</small>';
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-profesi" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-profesi" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-profesi" class="btn bg-red" name="link-delete-profesi" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';

                                        joData.push({
                                            index: (i+1),
                                            profesi: {
                                                id: ( profesi[i].jenisProfesi !== null ? profesi[i].jenisProfesi.id : 0 ),
                                                name: ( profesi[i].jenisProfesi !== null ? profesi[i].jenisProfesi.name : "" )
                                            },
                                            penyelenggara: profesi[i].penyelenggara,
                                            tahun_lulus: profesi[i].tahun_lulus,
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
                    libUtil.writeLog(">>> Jenis Profesi ID : " + req.body.profesi_id);
                    if( req.body.act == 'add' ){
                        libUtil.getCurrDateTime(function(currTime){
                            return modelProfesi
                                .create({
                                    user_id: decryptedUserId,                                   
                                    profesi_id: req.body.jenis_profesi_id,
                                    penyelenggara: req.body.penyelenggara,
                                    tahun_lulus: ( req.body.tahun_lulus !== null && req.body.tahun_lulus !== "" ? req.body.tahun_lulus : 0 ),          
                                    createdAt: currTime
                                })
                                .then( profesi => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data Profesi berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    }else if( req.body.act == 'edit' ){
                        libUtil.getDecrypted( req.body.profesi_id, function( decryptedId ){       
                            libUtil.getCurrDateTime(function(currTime){
                                return modelProfesi
                                    .update({
                                        profesi_id: req.body.jenis_profesi_id,
                                        penyelenggara: req.body.penyelenggara,
                                        tahun_lulus: ( req.body.tahun_lulus !== null && req.body.tahun_lulus !== "" ? req.body.tahun_lulus : 0 ),  
                                        updatedAt: currTime
                                    },{
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data Profesi berhasil disimpan."
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

                    return modelProfesi.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){

                            modelProfesi.destroy({
                                where: {
                                    id: decryptedId
                                }
                            })
                            .then( dataDelete => {

                                joResult = JSON.stringify({
                                    'status_code': '00',
                                    'status_msg': 'Data berhasil dihapus'
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