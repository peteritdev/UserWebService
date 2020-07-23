const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

var config = require('../config/config.json');

const modelJurusan = require('../models').db_pendidikan_jurusan;
const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

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

                return modelJurusan
                    .findOrCreate({
                        where:{
                            id: req.body.id
                        },
                        defaults: {
                            name: req.body.name,
                            createdAt: currDateTime
                        }
                    })
                    .spread((dataJurusan, created) => {

                        if( created ){
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Pendidikan Jurusan successfully created",
                                "id": dataJurusan.id
                            });
                            res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
                        }else{
                            modelJurusan
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
                                        "status_msg": "Pendidikan Jurusan successfully updated",
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