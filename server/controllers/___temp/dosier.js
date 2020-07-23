const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const momentPrecise = require('moment-precise-range-plugin');
const passwordGenerator = require('generate-password');
const bcrypt = require('bcryptjs');
const dateFormat = require('dateformat');

const moment    = require('moment');
var env         = process.env.NODE_ENV || 'development';
var configEnv    = require(__dirname + '/../config/config.json')[env];
var config = require('../config/config.json');
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const promise   = require('promise');

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification.js');
const libSetting = require('../libraries/setting.js');

const modelRiwayatDosier = require('../models').user_history_dosier;
const modelFileType = require('../models').db_filetypes;

const userService = require('../service/userservice.js');

module.exports = {

    list( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var keyword = req.query.keyword;
				var xOffset = parseInt(req.query.offset);
				var xLimit = parseInt(req.query.limit);
                var draw = req.query.draw;
                var xId = req.query.id;
                var xFileTypeId = req.query.file_type;

                var joData = [];

                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    var strSql;
                    var strSqlCount;
                    var filterFileType = "";
                    var filterUser = "";
                    var orderCol = "";
                    var orderDir = "";

                    var navigationDownload = "";

                    var objJSONWhere = {};

                    if( xFileTypeId != "" ){
                        filterFileType = " AND file_type_id = :fileTypeId ";
                        objJSONWhere.fileTypeId = xFileTypeId;
                    }

                    if( xId != "" ){
                        filterUser = " AND d.user_id = :userId ";
                        objJSONWhere.userId = decryptedId;
                    }

                    if( req.query.order_col != "" && req.query.order_dir != "" ){
                        if( req.query.order_col == 3 ){
                            orderCol = " ORDER BY d.updated_at " + req.query.order_dir;
                        }
                    }

                    strSql = " SELECT d.id AS dosier_id, d.user_id, d.file_type_id, ft.name AS file_type_name, ft.path_file AS path_file, d.file_name, d.updated_at " + 
                             " FROM user_history_dosier d INNER JOIN db_filetypes ft ON d.file_type_id = ft.id " + 
                             " WHERE (1=1) " + filterUser + filterFileType + orderCol + 
                             " LIMIT " + xOffset + "," + xLimit;

                    strSqlCount = " SELECT COUNT(0) AS num_row " + 
                                    " FROM user_history_dosier d INNER JOIN db_filetypes ft ON d.file_type_id = ft.id " + 
                                    " WHERE (1=1) " + filterUser + filterFileType + orderCol;

                    return sequelize.query( strSqlCount, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( data => {
                        sequelize.query( strSql, {
                            replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                        })
                        .then( historyDosier => {
                            for( var i = 0; i < historyDosier.length; i++ ){
                                libUtil.getEncrypted( (historyDosier[i].dosier_id).toString(), function(encryptedId){
                                    libUtil.getEncrypted( (historyDosier[i].user_id).toString(), function(ecnryptedUserData){                                       

                                        navigationDownload = "";

                                        if( historyDosier[i].file_name != "" ){
                                            navigationDownload = '<a href="' + ( config.frontParam.rootFilePath + historyDosier[i].path_file + historyDosier[i].file_name ) + '" class="btn btn-primary btn-md"><i class="glyphicon glyphicon-download-alt"></i></a>';
                                        }

                                        joData.push({
                                            index: (i+1),
                                            dosier_id: historyDosier[i].dosier_id,
                                            user_id: historyDosier[i].user_id,
                                            file_type_id: historyDosier[i].file_type_id,
                                            file_type_name: historyDosier[i].file_type_name,
                                            file: navigationDownload,
                                            updated_at: historyDosier[i].updated_at
                                        });
                                    });
                                });
                            }

                            console.log(">>> LENGTH : " + historyDosier.length);

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "data": joData,
                                "recordsTotal": data[0].num_row,
                                "recordsFiltered": data[0].num_row,
                                "draw": draw
                            });

                            console.log(">>> RESULT DOSIER : " + joResult);

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);

                        });
                    });
                });
                
            }

        });

    },

    save( req, res ){

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

                libUtil.getDecrypted( req.body.user_id, function(decryptedId){
                    return modelRiwayatDosier
                        .create({
                            file_type_id: req.body.type_id,
                            file_name: req.body.file_name,
                            createdAt: currDateTime,
                            created_user: parseInt(req.headers['x-id']),
                            user_id: decryptedId
                        })
                        .then( dosier =>{

                            userService.updateFileName( req.body.file_name, decryptedId, req.body.type_id );

                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Dosier berhasil disimpan."
                            });

                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } )
                        .catch( error => {
                            libUtil.writeLog("Error [Dosier.Save] : " + error);
                        } );
                });
            }

        });

    }

}