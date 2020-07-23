const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const passwordGenerator = require('generate-password');
const bcrypt = require('bcryptjs');

var config = require('../config/config.json');

const modelGolongan = require('../models').db_golongan;

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
                var joData = [];

                return modelGolongan.findAll({

                })
                .then( golongan => {
                    for( var i = 0; i < golongan.length; i++ ){
                        joData.push({
                            id: golongan[i].id,
                            name: golongan[i].name
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

    }

}

