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

const modelUserAttendance = require('../models').user_attendances;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification.js');
const libSetting = require('../libraries/setting.js');

module.exports = {
    getTodayAttendance( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];
                var objJSONWhere = {};
                
                if( req.query.id != "" ){
                   
                    libUtil.getDecrypted( req.query.id, function(decryptedId){

                        objJSONWhere.user_id = decryptedId;

                        strSql = " SELECT id, user_id, attendance_date, clock_in, clock_out, healthy_check_status, healthy_check_status_clockout,created_at, updated_at " + 
                                " FROM user_attendances " + 
                                " WHERE user_id = :user_id AND attendance_date = CURDATE() ";
    
                        return sequelize.query( strSql, {
                            replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                        } )
                        .then( attendance => {
                            if( attendance.length > 0 ){
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "OK",
                                    "attendance_date": attendance[0].attendance_date,
                                    "clock_in": attendance[0].clock_in,
                                    "clock_out": attendance[0].clock_out,
                                    "healthy_check_status": attendance[0].healthy_check_status,
                                    "healthy_check_status_clockout": attendance[0].healthy_check_status_clockout
                                });

                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            }else{
                                joResult = JSON.stringify({
                                    "status_code": "-99",
                                    "status_msg": "There is no data attendance today"
                                });

                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            }
                        } );
                    });

                    
                }else{
                    joResult = JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Id not valid."
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                }                
            }
        });
    },

    clockIn( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                libUtil.getDecrypted( req.body.id, function(decryptedId){                   

                    libUtil.getCurrDate(function(currDate){
                        libUtil.getCurrTime(function(currTime){
                            return modelUserAttendance
                                .findOrCreate({
                                    where:{
                                        attendance_date: currDate,
                                        user_id: decryptedId
                                    },
                                    defaults:{
                                        clock_in: currTime//req.body.time_clockin,
                                        //geoloc_latitude_clockin: req.body.latitude,
                                        //geoloc_langitude_clockin: req.body.longitude
                                    }                                    
                                })
                                .spread( ( data, created ) => {
                                    if( created ){
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Anda telah berhasil, <strong>Waktu Kedatangan</strong> pada jam <strong>" + currTime + "</strong>."
                                        });
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    }else{
                                        joResult = JSON.stringify({
                                            "status_code": "-99",
                                            "status_msg": "Anda sudah absensi sebelumnya"
                                        });
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    }                              
                                } );
                        });                        
                    });
                        
                });
            }
        });
    },

    clockOut( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                libUtil.getDecrypted( req.body.id, function(decryptedId){                   

                    libUtil.getCurrDate(function(currDate){
                        libUtil.getCurrTime(function(currTime){
                            return modelUserAttendance
                                .update({
                                    clock_out: currTime//req.body.time_clockout
                                    //geoloc_latitude_clockout: req.body.latitude,
                                    //geoloc_langitude_clockout: req.body.longitude
                                },{
                                    where: {
                                        user_id: decryptedId,
                                        attendance_date: currDate
                                    }
                                })
                                .then( data => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Anda telah berhasil, <strong>Waktu Kepulangan</strong> pada jam <strong>" + currTime + "</strong>."
                                    });
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
                        });                        
                    });
                        
                });
            }
        });
    },

    updateHealthyCheckStatus( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                libUtil.getDecrypted( req.body.id, function(decryptedId){                   

                    libUtil.getCurrDate(function(currDate){
                        libUtil.getCurrTime(function(currTime){
                            return modelUserAttendance
                                .update({
                                    healthy_check_status: req.body.healthy_check_status,
                                    healthy_check_desc: req.body.healthy_check_desc
                                },{
                                    where: {
                                        user_id: decryptedId,
                                        attendance_date: currDate
                                    }
                                })
                                .then( data => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data kesehatan anda berhasil disimpan."
                                    });
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
                        });                        
                    });
                        
                });
            }
        });
    },

    updateHealthyCheckStatusClockout( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
            var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                libUtil.getDecrypted( req.body.id, function(decryptedId){                   

                    libUtil.getCurrDate(function(currDate){
                        libUtil.getCurrTime(function(currTime){
                            return modelUserAttendance
                                .update({
                                    healthy_check_status_clockout: req.body.healthy_check_status,
                                    healthy_check_desc_clockout: req.body.healthy_check_desc
                                },{
                                    where: {
                                        user_id: decryptedId,
                                        attendance_date: currDate
                                    }
                                })
                                .then( data => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data kesehatan anda berhasil disimpan."
                                    });
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
                        });                        
                    });
                        
                });
            }
        });
    },

    getAttendanceReport( req, res ){
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
                var xAttendanceDate = "";

                var strSql;
                var strSqlCount;
                var filterKeyword = "";
                var filterAttendanceDate = "";
                var filterUnorInduk = "";
                var filterKondisiKesehatan = "";
                var orderCol = "";
                var orderDir = "";
                var strSqlLimit = "";

                var objJSONWhere = {};

                var joData = [];

                if( req.query.tgl_absen != null && req.query.tgl_absen != "" ){
                    xAttendanceDate = libUtil.parseToFormattedDate( req.query.tgl_absen );
                    filterAttendanceDate = " AND ua.attendance_date = :attendanceDate";
                    objJSONWhere.attendanceDate = xAttendanceDate;
                }

                if( req.query.unor_induk_id != null && req.query.unor_induk_id != "" ){
                    filterUnorInduk = " AND u.unor_induk_id = :unorIndukId ";
                    objJSONWhere.unorIndukId = xUnorIndukId;
                }

                if( req.query.keyword != "" ){
                    filterKeyword = " AND ( ( u.name LIKE '%" + xKeyword + "%' ) OR ( u.nip LIKE '%" + xKeyword + "%' ) ) ";
                }

                if( req.query.kondisi_kesehatan != 0 && req.query.kondisi_kesehatan != "" && req.query.kondisi_kesehatan != null ){
                    filterKondisiKesehatan = " AND (ua.healthy_check_status = :kondisiKesehatan OR " + 
                                             "      ua.healthy_check_status_clockout = :kondisiKesehatan) ";
                    objJSONWhere.kondisiKesehatan = req.query.kondisi_kesehatan;
                }

                if( req.query.order_col != "" && req.query.order_dir != "" ){

                    if( req.query.order_col == 0 ){
                        orderCol = " ORDER BY dui.name " + req.query.order_dir;
                    }else if( req.query.order_col == 1 ){
                        orderCol = " ORDER BY ua.attendance_date " + req.query.order_dir;
                    }else if( req.query.order_col == 2 ){
                        orderCol = " ORDER BY u.nip " + req.query.order_dir;
                    }else if( req.query.order_col == 3 ){
                        orderCol = " ORDER BY u.name " + req.query.order_dir;
                    }else if( req.query.order_col == 4 ){
                        orderCol = " ORDER BY ua.clock_in " + req.query.order_dir;
                    }else if( req.query.order_col == 5 ){
                        orderCol = " ORDER BY ua.clock_out " + req.query.order_dir;
                    }else{
                        orderCol = " ORDER BY ua.attendance_date DESC, ua.clock_in DESC";
                    }
                    
                }else{
                    orderCol = " ORDER BY ua.clock_in DESC";
                }

                if( xLimit != 0 && xLimit != -1 ){
                    strSqlLimit = " LIMIT " + xOffset + "," + xLimit;
                }

                strSql = " SELECT dui.name AS unor_induk_name, DATE_FORMAT(ua.attendance_date, '%d-%m-%Y') AS 'attend_date', u.nip, u.name, ua.clock_in, ua.clock_out, ua.healthy_check_status, ua.healthy_check_desc, ua.healthy_check_status_clockout, ua.healthy_check_desc_clockout  " + 
                         " FROM users u INNER JOIN user_attendances ua " + 
                         "  ON u.id = ua.user_id " + 
                         "    INNER JOIN db_unor_induk dui ON dui.id = u.unor_induk_id " + 
                         " WHERE (1=1) " + filterAttendanceDate + filterUnorInduk + filterKondisiKesehatan + filterKeyword + orderCol + strSqlLimit;

                strSqlCount = " SELECT COUNT(0) AS num_row " + 
                              " FROM users u INNER JOIN user_attendances ua " + 
                              "  ON u.id = ua.user_id " + 
                              "    INNER JOIN db_unor_induk dui ON dui.id = u.unor_induk_id " + 
                              " WHERE (1=1) " + filterAttendanceDate + filterUnorInduk + filterKondisiKesehatan + filterKeyword;

                return sequelize.query( strSqlCount, {
                    replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                } )
                .then( data => {
                    sequelize.query( strSql, {
                        replacements: objJSONWhere, type: sequelize.QueryTypes.SELECT
                    } )
                    .then( attendance => {
                        for( var i = 0; i < attendance.length; i++ ){
                            joData.push({
                                index: (i+1),
                                unor_induk: attendance[i].unor_induk_name,
                                attendance_date: attendance[i].attend_date,
                                nip: attendance[i].nip,
                                user_name: attendance[i].name,
                                clock_in: attendance[i].clock_in,
                                clock_out: attendance[i].clock_out,
                                healthy_check_status: ( attendance[i].healthy_check_status == 1 ? 'Sehat' : ( attendance[i].healthy_check_status == 2 ? 'Sakit' : '-' ) ),
                                healthy_check_desc: attendance[i].healthy_check_desc,

                                healthy_check_status_clockout: ( attendance[i].healthy_check_status_clockout == 1 ? 'Sehat' : ( attendance[i].healthy_check_status_clockout == 2 ? 'Sakit' : '-' ) ),
                                healthy_check_desc_clockout: attendance[i].healthy_check_desc_clockout
                            });
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

                
            }

        });
    }
}
