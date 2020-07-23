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

const modelUser = require('../models').users;
const modelUserPendidikanUmum = require('../models').users_pendidikan_umum;
const modelPeninjauanMasaKerja = require('../models').user_history_peninjauan_masa_kerja;
const modelNews = require('../models').news;
const modelSKP = require('../models').user_history_skp;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');
const libNotif = require('../libraries/notification');

module.exports = {

    getUserBirthday( req, res ){

        var joResult;
        var _currDate;

        libUtil.getCurrDate(function( currTime ){
            _currDate = currTime;
        });

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var joData = [];
                var month = moment().month()+1;
                var today = moment().date();
                
                return modelUser.findAndCountAll({
                    where:{
                        $and:[
                            sequelize.where( sequelize.fn( 'month', sequelize.col("tanggal_lahir") ), month )
                        ],
                        /*$or: [
                            sequelize.where( sequelize.fn( 'day', sequelize.col("tanggal_lahir") ), today )
                        ]*/
                    },
                    limit: 20
                })
                .then( data => {
                    modelUser.findAll({
                        where:{
                            $and:[
                                sequelize.where( sequelize.fn( 'month', sequelize.col("tanggal_lahir") ), month )
                            ],
                            /*$or: [
                                sequelize.where( sequelize.fn( 'day', sequelize.col("tanggal_lahir") ), today )
                            ]*/
                        },
                        limit: 20
                    })
                    .then( user => {

                        for( var i = 0; i < user.length; i++ ){

                            libUtil.getEncrypted( (user[i].id).toString(), function( encryptedData ){
                                
                                var linkName = '<a class="users-list-name" href="' + config.frontParam.baseUrl + '/profile?id=' + encryptedData + '">' + ( user[i].name.length > 15 ? user[i].name.substring(0,15) + '...' : user[i].name ) + '</a>';
                                var linkNon = '<a class="users-list-name" href="#">' + ( user[i].name.length > 15 ? user[i].name.substring(0,15) + '...' : user[i].name ) + '</a>';
                                joData.push({
                                    nip: user[i].nip,
                                    name: linkName,
                                    nameNonLink: linkNon,
                                    picture: user[i].picture
                                });

                            });

                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data": joData,
                            "recordsTotal": data.count
                        });

                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );
                } );      

            }

        });

    },

    getPendidikanTerakhir( req, res ){

        var joResult;
        var _currDate;

        libUtil.getCurrDate(function( currTime ){
            _currDate = currTime;
        });

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    modelUserPendidikanUmum.findAll({
                        where:{
                            [Op.and]:[
                                {
                                    user_id: decryptedId
                                }
                            ]
                        },
                        order:[
                            ['tahun_kelulusan','DESC']
                        ],
                        limit: 1
                    })
                    .then( user => {

                        for( var i = 0; i < user.length; i++ ){

                            libUtil.getEncrypted( (user[i].id).toString(), function( encryptedData ){
                                
                                joData.push({
                                    pendidikan_nama: user[i].pendidikan_nama,
                                    jurusan_nama: user[i].jurusan_nama,
                                    tahun_lulus: user[i].tahun_kelulusan
                                });

                            });

                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data": joData,
                            "recordsTotal": data.count
                        });

                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );  
                    
                });

            }

        });

    },

    getPeninjauanMasaKerja( req, res ){

        var joResult;
        var _currDate;

        libUtil.getCurrDate(function( currTime ){
            _currDate = currTime;
        });

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    modelPeninjauanMasaKerja.findAll({
                        where:{
                            [Op.and]:[
                                {
                                    user_id: decryptedId
                                }
                            ]
                        },
                        order:[
                            ['tgl_sk','DESC']
                        ],
                        limit: 1
                    })
                    .then( user => {

                        for( var i = 0; i < user.length; i++ ){

                            libUtil.getEncrypted( (user[i].id).toString(), function( encryptedData ){
                                
                                joData.push({
                                    instansi_perusahaan: user[i].instansi_perusahaan,
                                    no_sk: user[i].no_surat_keputusan,
                                    masa_kerja_tahun: ( user[i].masa_kerja_tahun !== null ? user[i].masa_kerja_tahun : 0 ),
                                    masa_kerja_bulan: ( user[i].masa_kerja_bulan !== null ? user[i].masa_kerja_bulan : 0 )
                                });

                            });

                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data": joData,
                            "recordsTotal": data.count
                        });

                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );  
                    
                });

            }

        });

    },

    getNews( req, res ){
        var joResult;
        var _currDate;
        var _currDateTime;

        libUtil.getCurrDate(function( currTime ){
            _currDate = currTime;
        });

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var joData = [];
                
                modelNews.findAll({
                    where:{
                        [Op.and]:[
                            {
                                effective_date: {
                                    [Op.lte]: _currDate
                                }
                            },
                            {
                                expire_at: {
                                    [Op.gte]: _currDate
                                }
                            },
                            {
                                status: 1
                            }
                        ]
                    },
                    order:[
                        ['created_at','ASC']
                    ]
                })
                .then( news => {

                    for( var i = 0; i < news.length; i++ ){

                        libUtil.getEncrypted( (news[i].id).toString(), function( encryptedData ){
                            
                            joData.push({
                                id: encryptedData,
                                title: news[i].title,
                                content: news[i].content,
                                created_at: news[i].created_at
                            });

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

    getSKP( req, res ){
        var joResult;
        var _currDate;
        var _currDateTime;

        libUtil.getCurrDate(function( currTime ){
            _currDate = currTime;
        });

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){
                    modelSKP.findOne({
                        where:{
                            [Op.and]:[
                                {
                                    user_id: decryptedId,
                                    tahun: req.query.skp
                                }
                            ]
                        },
                        order:[
                            ['tahun','DESC']
                        ],
                        limit: 1
                    })
                    .then( skp => {

                        if( skp != null ){
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
                                "nilai_skp": skp.nilai_skp
                            });
    
                        }else{
                            joResult = JSON.stringify({
                                "status_code": "-99",
                                "status_msg": "SKP Tidak ditemukan"
                            });
    
                        }
                        
                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );

                });

            }

        });
    }

}