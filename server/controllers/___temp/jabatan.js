const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

var config = require('../config/config.json');

const modelJabatan = require('../models').db_jabatan;
const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    list( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJabatan.findAll({

                })
                .then( jabatan => {
                    for( var i = 0; i < jabatan.length; i++ ){
                        joData.push({
                            id: jabatan[i].id,
                            name: jabatan[i].name
                        });
                    }

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        "data": joData
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                        
                } );
            }
        });

    },

    saveFromSync( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;
            var currDateTime;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                libUtil.getCurrDateTime(function(curr){
                    currDateTime = curr;
                });

                return modelJabatan
                    .findOrCreate({
                        where:{
                            id: req.body.id
                        },
                        defaults: {
                            name: req.body.name,
                            createdAt: currDateTime
                        }
                    })
                    .spread((dataJabatan, created) => {

                        if( created ){
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Jabatan successfully created",
                                "id": dataJabatan.id
                            });
                            res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
                        }else{
                            modelJabatan
                                .update({
                                    name: req.body.name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: req.body.id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Jabatan successfully updated",
                                        "id": req.body.id
                                    });
                                    res.setHeader('Content-Type','application/json');
									res.status(201).send(joResult);
                                } )
                                .catch( error => res.status(400).send(error) );;
                        }

                    })
                    .catch( error => res.status(400).send(error) );

            }
        });

    }

}