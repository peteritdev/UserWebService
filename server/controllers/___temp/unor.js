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

const modelUnor = require('../models').db_unor;

module.exports = {

    list(req,res){
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

                var joData = [];
                
                var strSql;
                var strSqlCount;
                var filterKeyword = "";
                var filterId;
                var objJSONWhere = {};

                if( req.query.keyword != "" ){
                    filterKeyword = " AND ( ( u1.name LIKE '%" + xKeyword + "%' ) OR ( u2.name LIKE '%" + xKeyword + "%' ) ) ";
                }

                strSql = " SELECT u1.id AS unor_id," +
                            "     u1.parent_id AS unor_parent_id," +
                            "     u1.name AS unor_name," + 
                            "     u2.name AS unor_parent_name," +    
                            "     u1.unor_type AS unor_type_id," + 
                            "     ( CASE WHEN u1.unor_type = 1 THEN 'Bagian/Sub Bagian' WHEN u1.unor_type = 2 THEN 'Fungsional Umum' ELSE '-' END ) AS unor_type_name" +                       
                            " FROM db_unor u1 INNER JOIN db_unor u2 " + 
                            "      ON u1.parent_id = u2.id " +  
                            " WHERE (1=1) AND u1.parent_id IS NOT NULL " + filterKeyword + 
                            " LIMIT " + xOffset + "," + xLimit;

                strSqlCount = " SELECT COUNT(0) AS num_row " + 
                             " FROM db_unor u1 INNER JOIN db_unor u2 " + 
                             "      ON u1.parent_id = u2.id " +  
                             " WHERE (1=1) AND u1.parent_id IS NOT NULL " + filterKeyword;

                return sequelize.query( strSqlCount, {
                    replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                } )
                .then( data => {
                    sequelize.query( strSql, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( dataUnor => {
                        
                        for( var i = 0; i < dataUnor.length; i++ ){
                            libUtil.getEncrypted( ( dataUnor[i].unor_id ).toString(), function(encryptedId){
                                libUtil.getEncrypted( ( dataUnor[i].unor_parent_id ).toString(), function(encryptedParentId){

                                    var navigationEdit = ''; 

                                    var dataForEdit = encryptedId + config.frontParam.separatorData + 
                                                      dataUnor[i].unor_parent_id + config.frontParam.separatorData + 
                                                      dataUnor[i].unor_name + config.frontParam.separatorData + 
                                                      dataUnor[i].unor_type_id;
                                    navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-unor-form" class="btn bg-navy" name="link-edit-masterunor" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                    joData.push({
                                        index: (i+1),
                                        id: encryptedId,
                                        parent_id: encryptedParentId,
                                        name: dataUnor[i].unor_name,
                                        parent_name: dataUnor[i].unor_parent_name,
                                        type: dataUnor[i].unor_type_id,
                                        type_name: dataUnor[i].unor_type_name,
                                        navigation: navigationEdit
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

                console.log(">>> LOG HERE... : " + req.body.name);

                if( req.body.act == 'add' ){
                    libUtil.getCurrDateTime(function(currTime){                       

                        return modelUnor
                            .findOrCreate({
                                where:{
                                    name: req.body.name,
                                },
                                defaults:{
                                    unor_type: req.body.type,
                                    parent_id: req.body.parent_id,
                                    createdAt: currTime
                                }
                            })
                            .spread( ( masterUnor, created ) => {
                                if( created ){
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Unor berhasil disimpan."
                                    });
                                }else{
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Master Unor tidak dapat duplikat."
                                    });
                                }

                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Create [Unor.Save] : " + error);
                            } );;
                    });
                }else if( req.body.act == 'edit' ){
                    libUtil.getDecrypted( req.body.id, function( decryptedId ){       
                        //libUtil.getDecrypted( req.body.parent_id,function( decryptedParentId ){
                            return modelUnor
                                .update({
                                    parent_id : req.body.parent_id,
                                    name: req.body.name
                                },{
                                    where:{
                                        id: decryptedId
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data Unor berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        //});
                    } );
                }
                
            }
        });
    }

}
