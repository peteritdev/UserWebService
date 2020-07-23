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

const modelPenghargaan = require('../models').user_history_penghargaan;
const modelJenisPenghargaan = require('../models').db_jenis_penghargaan;

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
                    return modelPenghargaan.findAndCountAll({
                        where :{
                            [Op.or]:[
                                {
                                    '$jenisPenghargaan.name$':{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    no_sk:{
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
                        include:[{
                            model: modelJenisPenghargaan,
                            as: 'jenisPenghargaan'
                        }]
                    })
                    .then( data => {
                        modelPenghargaan.findAll({
                            where :{
                                [Op.or]:[
                                    {
                                        '$jenisPenghargaan.name$':{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        no_sk:{
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
                            include:[{
                                model: modelJenisPenghargaan,
                                as: 'jenisPenghargaan'
                            }],
                            limit: limit,
                            offset: offset,
                        })
                        .then( penghargaan => {
                            if( penghargaan.length > 0 ){
                                for( var i = 0; i < penghargaan.length; i++ ){
                                    libUtil.getEncrypted( (penghargaan[i].id).toString(), function( encryptedData ){                                      
                                        
                                        joData.push({
                                            jenis_penghargaan:{
                                                id: ( penghargaan[i].jenisPenghargaan !== null ? penghargaan[i].jenisPenghargaan.id : 0 ),
                                                name: ( penghargaan[i].jenisPenghargaan !== null ? penghargaan[i].jenisPenghargaan.name : "" ),
                                            },
                                            tgl_sk: ( penghargaan[i].tgl_sk !== null && penghargaan[i].tgl_sk !== "" && penghargaan[i].tgl_sk !== "0000-00-00" ? dateFormat(penghargaan[i].tgl_sk, "dd-mm-yyyy") : ""),
                                            no_sk: ( penghargaan[i].no_sk == null ? '' : penghargaan[i].no_sk ),
                                            tahun: ( penghargaan[i].tahun == null ? '' : penghargaan[i].tahun )
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

    }

}

