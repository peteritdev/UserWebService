const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const passwordGenerator = require('generate-password');
const bcrypt = require('bcryptjs');

var config = require('../config/config.json');

const modelUnitKerja = require('../models').db_unit_kerja;

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

                return modelUnitKerja.findAll({

                })
                .then( unitKerja => {
                    for( var i = 0; i < unitKerja.length; i++ ){
                        joData.push({
                            id: unitKerja[i].id,
                            parent: unitKerja[i].parent_id,
                            name: unitKerja[i].name
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

