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

const modelUserJournal = require('../models').user_journals;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification.js');
const libSetting = require('../libraries/setting.js');

var htmlEncode = require('js-htmlencode');

module.exports = {
    list( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var xKeyword = req.query.keyword;
                var xOffset = parseInt( req.query.offset );
                var xLimit = parseInt( req.query.limit );
                var xDraw = req.query.draw;
                var xUnorIndukId = req.query.unor_induk_id;
                var xId = req.query.id;
                var xJournalDate = "";

                var joData = [];

                if( req.query.tgl_jurnal != null && req.query.tgl_jurnal != "" ){
					xJournalDate = libUtil.parseToFormattedDate( req.query.tgl_jurnal );
                }

                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    var strSql;
                    var strSqlCount;
                    var filterJournalDate = "";
                    var filterUser = "";
                    var filterKeyword = "";
                    var filterUnorInduk = "";
                    var orderCol = "";
                    var orderDir = "";
                    var navigationDetail = "";
                    var strSqlLimit = "";

                    var objJSONWhere = {};

                    if( xJournalDate != "" ){
                        filterJournalDate = " AND uj.journal_date = :journalDate ";
                        objJSONWhere.journalDate = xJournalDate;
                    }

                    if( req.query.role_id != 1 && req.query.role_id != 3 && req.query.role_id != 0 ){
                        filterUser = " AND uj.user_id = :userId ";
                        objJSONWhere.userId = decryptedId;
                    }

                    if( req.query.keyword != "" ){
                        filterKeyword = " AND ( ( u.name LIKE '%" + xKeyword + "%' ) OR ( u.nip LIKE '%" + xKeyword + "%' ) ) ";
                    }
                    

                    if( req.query.order_col != "" && req.query.order_dir != "" ){

                        if( req.query.order_col == 0 ){
                            orderCol = " ORDER BY u.name " + req.query.order_dir;
                        }else if( req.query.order_col == 1 ){
                            orderCol = " ORDER BY uj.journal_date " + req.query.order_dir;
                        }else if( req.query.order_col == 2 ){
                            orderCol = " ORDER BY uj.subject " + req.query.order_dir;
                        }else{
                            orderCol = " ORDER BY uj.journal_date DESC";
                        }
                        
                    }else{
                        orderCol = " ORDER BY uj.journal_date DESC";
                    }

                    if( xLimit != 0 && xLimit != -1 ){
                        strSqlLimit = " LIMIT " + xOffset + "," + xLimit;
                    }

                    if( xUnorIndukId != null && xUnorIndukId != "" ){
                        filterUnorInduk = " AND u.unor_induk_id = :unorIndukId ";
                        objJSONWhere.unorIndukId = xUnorIndukId;
                    }

                    strSql = " SELECT uj.id, dui.name AS unor_induk_name, u.nip, u.name AS `nama_pegawai`, DATE_FORMAT(uj.journal_date,'%d-%m-%Y') AS journal_date, uj.subject, uj.body, uj.created_at, uj.updated_at" + 
                             " FROM user_journals uj INNER JOIN users u ON uj.user_id = u.id " + 
                             "    INNER JOIN db_unor_induk dui ON dui.id = u.unor_induk_id " + 
                             " WHERE (1=1) AND uj.is_delete = 0 AND uj.user_id IS NOT NULL " + filterUnorInduk + filterJournalDate + filterUser + filterKeyword + orderCol + 
                             strSqlLimit; 

                    strSqlCount = " SELECT COUNT(0) AS num_row " + 
                                  " FROM user_journals uj INNER JOIN users u ON uj.user_id = u.id " + 
                                  " WHERE (1=1) AND uj.is_delete = 0 AND uj.user_id IS NOT NULL " + filterUnorInduk + filterJournalDate + filterUser + filterKeyword;

                    return sequelize.query( strSqlCount, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( data => {
                        sequelize.query( strSql, {
                            replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                        })
                        .then( userJournal => {
                            for( var i = 0; i < userJournal.length; i++ ){
                                libUtil.getEncrypted( (userJournal[i].id).toString(), function( encryptedId ){

                                    var dataForEdit = encryptedId + config.frontParam.separatorData + 
                                                      userJournal[i].subject + config.frontParam.separatorData +
                                                      htmlEncode(userJournal[i].body) + config.frontParam.separatorData + 
                                                      userJournal[i].journal_date + config.frontParam.separatorData + 
                                                      userJournal[i].nama_pegawai;

                                    navigationDetail = '<a href="#" class="btn btn-danger" data-toggle="modal" data-target="#modal-confirm-cancel-journal" name="link-confirm-cancel-journal" data="' +   dataForEdit + '"><i class="glyphicon glyphicon-remove"></i></a>&nbsp;' + 
                                                       '<a href="#" class="btn btn-success" data-toggle="modal" data-target="#modal-journal-detail" name="link-journal-detail" data="' + dataForEdit + '"><i class="glyphicon glyphicon-list-alt"></i></a>';
                                    joData.push({
                                        index: (i+1),
                                        unor_induk: userJournal[i].unor_induk_name,
                                        nip: userJournal[i].nip,
                                        user_name: userJournal[i].nama_pegawai,
                                        journal_date: userJournal[i].journal_date,
                                        subject: userJournal[i].subject,
                                        body: userJournal[i].body,
                                        created_at: userJournal[i].created_at,
                                        updated_at: userJournal[i].updated_at,
                                        navigation: navigationDetail,
                                        healthy_check_status: ( userJournal[i].healthy_check_status == 1 ? 'Sehat' : ( userJournal[i].healthy_check_status == 2 ? 'Sakit' : '-' ) ),
                                        healthy_check_desc: userJournal[i].healthy_check_desc
                                    });

                                } );
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

            var xJenisCuti = req.query.jenis_cuti;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var xJournalDate = "";
                if( req.body.tgl_jurnal != null && req.body.tgl_jurnal != "" ){
                    xJournalDate = libUtil.parseToFormattedDate( req.body.tgl_jurnal );
                }

                libUtil.getDecrypted( req.body.id, function(decryptedId){
                    libUtil.getCurrDateTime( function(currDateTime){
                        return modelUserJournal
                            .create({
                                user_id: decryptedId,
                                journal_date: xJournalDate,
                                subject: req.body.subject,
                                body: req.body.body,
                                is_delete: 0,
                                created_at: currDateTime
                            })
                            .then( data => {
                                try{
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data Jurnal berhasil disimpan."
                                    });
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                }catch( e ){
                                    libUtil.writeLog("Error [userjournal.save] : " + error);
                                    joResult = JSON.stringify({
                                        "status_code": "-99",
                                        "status_msg": "Data Jurnal gagal disimpan."
                                    });
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                }
                            } );
                    } );                    
                } );
                
            }
        });
    },

    cancel( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                libUtil.getDecrypted( req.body.id, function( decryptedId ){
                    return modelUserJournal
                        .update({
                            is_delete: 1
                        },{
                            where: {
                                id: decryptedId
                            }
                        })
                        .then( () => {
                            var joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "Data jurnal berhasil dihapus.",
                                //"new_password": newPassword
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } );
                } );
            }
        });
    }
}