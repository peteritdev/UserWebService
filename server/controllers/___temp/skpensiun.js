const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const bcrypt = require('bcryptjs');

var config = require('../config/config.json');

const modelSkpensiun = require('../models').user_sk_pensiun;
const modelGolongan = require('../models').db_golongan;
const modelUnitKerja = require('../models').db_unit_kerja;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    list( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
    
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;

            if( joAuth.status_code == '-99' ){
                res.setHeader('Content-Type','application/json');
                res.status(400).send(joAuth);
            }else{

                libUtil.getDecrypted( req.query.id, function(decrypted){
                    decryptedId = decrypted;
                });

                return modelSkpensiun.findOne({
                    where: {
                        user_id: decryptedId
                    }
                })
                .then( data => {
                    if( data == null ){
                        var joResult = JSON.stringify({
                            "status_code": "-99",
                            "status_msg": "User not found"
                        });
                        res.setHeader('Content-Type','application/json');
                        res.status(400).send(joResult);
                    }else{
                        var joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data":{
                                no_bkn: data.no_bkn,
                                tgl_bkn: data.tgl_bkn,
                                no_sk_pensiun: data.no_sk_pensiun,
                                tgl_pensiun: data.tgl_pensiun,
                                tmt_pensiun: data.tmt_pensiun,
                                golongan_id: data.golongan_id,
                                masa_kerja_thn: data.masa_kerja_thn,
                                masa_kerja_bln: data.masa_kerja_bln,
                                unit_kerja_id: data.unit_kerja_id
                            }
                        });

                        res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
                    }
                } );

            }

        });

    },

    save( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var currDateTime;
            var decryptedUserId;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                libUtil.getCurrDateTime(function(curr){
                    currDateTime = curr;
                });

                libUtil.getDecrypted( req.body.user_id, function(decrypted){
                    decryptedUserId = decrypted;
                });

                return modelSkpensiun
                    .findOrCreate({
                        where: {
                            user_id: decryptedUserId
                        },
                        defaults: {
                            no_bkn: req.body.no_bkn,
                            tgl_bkn: ( req.body.tgl_bkn != null && req.body.tgl_bkn != "" ? req.body.tgl_bkn : null ),
                            no_sk_pensiun: req.body.no_sk_pensiun,
                            tgl_pensiun: ( req.body.tgl_pensiun != null && req.body.tgl_pensiun != "" ? req.body.tgl_pensiun : null ),
                            tmt_pensiun: ( req.body.tmt_pensiun != null && req.body.tmt_pensiun != "" ? req.body.tmt_pensiun : null ),
                            golongan_id: req.body.golongan_id,
                            masa_kerja_thn: req.body.masa_kerja_thn,
                            masa_kerja_bln: req.body.masa_kerja_bln,
                            unit_kerja_id: req.body.unit_kerja_id,
                            createdAt:currDateTime
                        }
                    })
                    .spread(( skcpns, created ) => {
                        if( created ){
                            joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "SK-PENSIUN successfully created"
                            });
                            res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
                        }else{
                            modelSkpensiun
                                .update({
                                    no_bkn: req.body.no_bkn,
                                    tgl_bkn: ( req.body.tgl_bkn != null && req.body.tgl_bkn != "" ? req.body.tgl_bkn : null ),
                                    no_sk_pensiun: req.body.no_sk_pensiun,
                                    tgl_pensiun: ( req.body.tgl_pensiun != null && req.body.tgl_pensiun != "" ? req.body.tgl_pensiun : null ),
                                    tmt_pensiun: ( req.body.tmt_pensiun != null && req.body.tmt_pensiun != "" ? req.body.tmt_pensiun : null ),
                                    golongan_id: req.body.golongan_id,
                                    masa_kerja_thn: req.body.masa_kerja_thn,
                                    masa_kerja_bln: req.body.masa_kerja_bln,
                                    unit_kerja_id: req.body.unit_kerja_id,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        user_id: decryptedUserId
                                    }
                                })
                                .then(() => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "SK-PENSIUN successfully updated"
                                    });
                                    res.setHeader('Content-Type','application/json');
									res.status(201).send(joResult);
                                })
                                .catch( error => res.status(400).send(error) );
						}
                    })
                    .catch( error => res.status(400).send(error) );

            }

        });

    }
        
}