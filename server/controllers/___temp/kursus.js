const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const passwordGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dateFormat = require('dateformat');

var config = require('../config/config.json');

const modelKursus = require('../models').users_pendidikan_non_formal;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification');

module.exports = {

    list( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var statusCode;
                var statusMsg;

				var keyword = req.query.keyword;
				var offset = parseInt(req.query.offset);
				var limit = parseInt(req.query.limit);
                var draw = req.query.draw;

                var joData = [];

                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    return modelKursus.findAndCountAll({
                        where :{
                            [Op.or]:[
                                {
                                    name:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    penyelenggara:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    no_piagam:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                }
                            ],
                            [Op.and]:[
                                {
                                    user_id: decryptedId
                                }
                            ]
                        }
                    })
                    .then( data => {
                        modelKursus.findAll({
                            where :{
                                [Op.or]:[
                                    {
                                        name:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        penyelenggara:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        no_piagam:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    }
                                ],
                                [Op.and]:[
                                    {
                                        user_id: decryptedId
                                    }
                                ]
                            },                            
                            limit: limit,
                            offset: offset,
                        })
                        .then( kursus => {
                            if( kursus.length > 0 ){
                                for( var i = 0; i < kursus.length; i++ ){
                                    libUtil.getEncrypted( (kursus[i].id).toString(), function( encryptedData ){                                       
                                        
                                        joData.push({
                                            name: kursus[i].name,
                                            penyelenggara: kursus[i].penyelenggara,
                                            tgl_mulai: ( kursus[i].tgl_mulai !== null && kursus[i].tgl_mulai !== "" && kursus[i].tgl_mulai !== "0000-00-00" ? dateFormat(kursus[i].tgl_mulai, "dd-mm-yyyy") : ""),
                                            lama_kursus: kursus[i].lama_kursus,
                                            tahun_kursus: kursus[i].tahun_kursus,
                                            no_sertifikat: kursus[i].no_piagam
                                        });
                                    
                                    });
                                }

                                statusCode = "00";
                                statusMsg = "OK";

                            }else{
                                statusCode = "-99";
                                statusMsg = "Data not found";
                            }

                            joResult = JSON.stringify({
                                "status_code": statusCode,
                                "status_msg": statusMsg,
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

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var xTglMenikah = "";
				if( req.body.tgl_menikah != null && req.body.tgl_menikah != "" ){
					xTglMenikah = libUtil.parseToFormattedDate( req.body.tgl_menikah );
                }
                
                var xTglCerai = "";
				if( req.body.tgl_cerai != null && req.body.tgl_cerai != "" ){
					xTglCerai = libUtil.parseToFormattedDate( req.body.tgl_cerai );
				}

                libUtil.getDecrypted( req.body.user_id, function(decryptedUserId){
                    libUtil.getDecrypted( req.body.user_family_id, function(decryptedUserFamilyId){

                        if( req.body.act == "add" ){
                            modelUserKeluarga
                                .findOrCreate({
                                    where:{
                                        user_id: decryptedUserId,
                                        user_family_id: decryptedUserFamilyId                                    
                                    },
                                    defaults:{
                                        relasi_id: req.body.relasi_id,
                                        tgl_menikah: ( xTglMenikah == "" ? null : xTglMenikah ),
                                        akte_menikah: req.body.akte_menikah,
                                        tgl_cerai: ( xTglCerai == "" ? null : xTglCerai ),
                                        akte_cerai: req.body.akte_cerai,
                                        is_pns: req.body.is_pns,
                                        createdUser: parseInt(req.headers['x-id'])
                                    }
                                })
                                .spread( ( user, created ) => {
                                    if( created ){
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data successfully created"
                                        });
                                    }else{
                                        joResult = JSON.stringify({
                                            "status_code": "-99",
                                            "status_msg": "Data already exists."
                                        });
                                    }
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
                        }else if( req.body.act == "edit" ){
                            libUtil.getDecrypted( req.body.id, function(decryptedId){
                                modelUserKeluarga
                                    .update({
                                        user_family_id: decryptedUserFamilyId,
                                        relasi_id: req.body.relasi_id,
                                        tgl_menikah: ( xTglMenikah == "" ? null : xTglMenikah ),
                                        akte_menikah: req.body.akte_menikah,
                                        tgl_cerai: ( xTglCerai == "" ? null : xTglCerai ),
                                        akte_cerai: req.body.akte_cerai,
                                        is_pns: req.body.is_pns,
                                        modifiedUser: parseInt(req.headers['x-id'])
                                    },                                
                                    {
                                        where:{
                                            id: decryptedId                                  
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data successfully updated"
                                        });
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    } );

                            });
                        }

                    });

                });
            }

        });

    },

}

