const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
var config = require('../config/config.json');

const moment    = require('moment');
var env         = process.env.NODE_ENV || 'development';
var configEnv    = require(__dirname + '/../config/config.json')[env];
var config = require('../config/config.json');
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const promise   = require('promise');

const modelAgama = require('../models').db_agama;
const modelStatusPernikahan = require('../models').db_status_pernikahan;
const modelJenisPMK = require('../models').db_jenis_pmk;
const modelJabatan = require('../models').db_jabatan;
const modelJenisJabatanSKP = require('../models').db_skp_jenisjabatan;
const modelJenisHukuman = require('../models').db_jenis_hukuman;
const modelKppn = require('../models').db_kppn;
const modelSatuanKerja = require('../models').db_satuan_kerja;
const modelSatuanKerjaInduk = require('../models').db_satuan_kerja_induk;
const modelLokasi = require('../models').db_provinsi;
const modelUnor = require('../models').db_unor;
const modelUnorInduk = require('../models').db_unor_induk;
const modelPangkat = require('../models').db_pangkat;
const modelInstansiKerja = require('../models').db_instansi_kerja;
const modelJabatanFungsional = require('../models').db_jabatan_fungsional;
const modelInstansiInduk = require('../models').db_instansi_induk;
const modelJabatanFungsionalUmum = require('../models').db_jabatan_fungsional_umum; 
const modelJenisCLTN = require('../models').db_jenis_cltn; 
const modelJenisPengadaan = require('../models').db_jenis_pengadaan; 
const modelJenisProfesi = require('../models').db_profesi; 
const modelFileType = require('../models').db_filetypes;
const modelJenisCuti = require('../models').db_jenis_cuti;
const modelTujuanJabatan = require('../models').db_tujuan_jabatan;
const modelUser = require('../models').users;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    getAgama(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];
                return modelAgama
                    .findAll()
                    .then( data => {
                        for( var i = 0; i < data.length; i++ ){
                            joData.push({
                                id: data[i].id,
                                name: data[i].name
                            });
                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data":joData
                        });

                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );
            }
        });
    },

    getStatusNikah(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];
                return modelStatusPernikahan
                    .findAll()
                    .then( data => {
                        for( var i = 0; i < data.length; i++ ){
                            joData.push({
                                id: data[i].id,
                                name: data[i].name
                            });
                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data":joData
                        });

                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );
            }
        });
    },

    getJenisPMK(req,res){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];
                return modelJenisPMK
                    .findAll()
                    .then( data => {
                        for( var i = 0; i < data.length; i++ ){
                            joData.push({
                                id: data[i].id,
                                name: data[i].name
                            });
                        }

                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data":joData
                        });

                        res.setHeader('Content-Type','application/json');
                        res.status(201).send(joResult);

                    } );
            }
        });
    },

    getJenisJabatan( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJabatan.findAll()
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

    getJenisJabatanSKP( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJenisJabatanSKP.findAll()
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

    getJenisHukuman( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJenisHukuman.findAll()
                .then( jenisHukuman => {
                    for( var i = 0; i < jenisHukuman.length; i++ ){
                        joData.push({
                            id: jenisHukuman[i].id,
                            name: jenisHukuman[i].name
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

    getKppn( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelKppn.findAll()
                .then( kppn => {
                    for( var i = 0; i < kppn.length; i++ ){
                        joData.push({
                            id: kppn[i].id,
                            name: kppn[i].name
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

    getSatuanKerja( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelSatuanKerja.findAll()
                .then( satuanKerja => {
                    for( var i = 0; i < satuanKerja.length; i++ ){
                        joData.push({
                            id: satuanKerja[i].id,
                            name: satuanKerja[i].name
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

    getLokasi( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelLokasi.findAll()
                .then( lokasi => {
                    for( var i = 0; i < lokasi.length; i++ ){
                        joData.push({
                            id: lokasi[i].id,
                            name: lokasi[i].name
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

    getUnor( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelUnor.findAll({
                    where:{

                        $or:[
                            {
                                parent_id:{
                                    $ne: null
                                }
                            },
                            {
                                id:{
                                    $eq: 15
                                }
                            }
                        ]
                    }
                })
                .then( unor => {
                    for( var i = 0; i < unor.length; i++ ){
                        joData.push({
                            id: unor[i].id,
                            parent: unor[i].parent_id,
                            name: unor[i].name,

                        });
                    }

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        "data": joData
                    });

                    console.log(">>> Log : " + joResult);

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                        
                } );
            }
        });

    },

    getUnorInduk( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelUnorInduk.findAll()
                .then( unorInduk => {
                    for( var i = 0; i < unorInduk.length; i++ ){
                        joData.push({
                            id: unorInduk[i].id,
                            name: unorInduk[i].name
                        });
                    }

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        "data": joData
                    });

                    console.log(">>> Log : " + joResult);

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                        
                } );
            }
        });

    },

    getUnorHierarchy( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                var strSql = " SELECT  ";
            }
        });

    },

    getPangkat( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelPangkat.findAll()
                .then( pangkat => {
                    for( var i = 0; i < pangkat.length; i++ ){
                        joData.push({
                            id: pangkat[i].id,
                            name: pangkat[i].name
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

    getInstansiKerja( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelInstansiKerja.findAll()
                .then( instansiKerja => {
                    for( var i = 0; i < instansiKerja.length; i++ ){
                        joData.push({
                            id: instansiKerja[i].id,
                            name: instansiKerja[i].name
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

    getJabatanFungsional( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJabatanFungsional.findAll()
                .then( jabatanFungsional => {
                    for( var i = 0; i < jabatanFungsional.length; i++ ){
                        joData.push({
                            id: jabatanFungsional[i].id,
                            name: jabatanFungsional[i].name
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

    getJabatanFungsionalUmum( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJabatanFungsionalUmum.findAll()
                .then( jabatanFungsionalUmum => {
                    for( var i = 0; i < jabatanFungsionalUmum.length; i++ ){
                        joData.push({
                            id: jabatanFungsionalUmum[i].id,
                            name: jabatanFungsionalUmum[i].name
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

    getInstansiInduk( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelInstansiInduk.findAll()
                .then( instansiInduk => {
                    for( var i = 0; i < instansiInduk.length; i++ ){
                        joData.push({
                            id: instansiInduk[i].id,
                            name: instansiInduk[i].name
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

    getSatuanKerjaInduk( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelSatuanKerjaInduk.findAll()
                .then( satuanKerjaInduk => {
                    for( var i = 0; i < satuanKerjaInduk.length; i++ ){
                        joData.push({
                            id: satuanKerjaInduk[i].id,
                            name: satuanKerjaInduk[i].name
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

    getJenisCLTN( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJenisCLTN.findAll()
                .then( jenisCLTN => {
                    for( var i = 0; i < jenisCLTN.length; i++ ){
                        joData.push({
                            id: jenisCLTN[i].id,
                            name: jenisCLTN[i].name
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

    getJenisPengadaan( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJenisPengadaan.findAll()
                .then( jenisPengadaan => {
                    for( var i = 0; i < jenisPengadaan.length; i++ ){
                        joData.push({
                            id: jenisPengadaan[i].id,
                            name: jenisPengadaan[i].name
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

    getJenisProfesi( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJenisProfesi.findAll()
                .then( jenisProfesi => {
                    for( var i = 0; i < jenisProfesi.length; i++ ){
                        joData.push({
                            id: jenisProfesi[i].id,
                            name: jenisProfesi[i].name
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

    getFileTypeByCode( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelFileType.findOne({
                    where: {
                        [Op.or]:[{
                            code: req.query.keyword
                        }]
                    }
                })
                .then( fileType => {

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        "id": fileType.id,
                        "name": fileType.name
                    });

                    res.setHeader('Content-Type','application/json');
                    res.status(201).send(joResult);
                        
                } );
            }
        });

    },

    getFileType( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelFileType.findAll()
                .then( fileType => {

                    for( var i = 0; i < fileType.length; i++ ){
                        joData.push({
                            id: fileType[i].id,
                            name: fileType[i].name
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

    getTujuanJabatan( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelTujuanJabatan.findAll()
                .then( tujuanJabatan => {
                    for( var i = 0; i < tujuanJabatan.length; i++ ){
                        joData.push({
                            id: tujuanJabatan[i].id,
                            name: tujuanJabatan[i].name
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

    getJenisCuti( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelJenisCuti.findAll()
                .then( jenisCuti => {
                    for( var i = 0; i < jenisCuti.length; i++ ){
                        joData.push({
                            id: jenisCuti[i].id,
                            name: jenisCuti[i].name
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

    getUser( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var joData = [];

                return modelUser.findAll({
                    where:{
                        role_id:2
                    },
                    order:[['name','ASC']]
                })
                .then( user => {
                    for( var i = 0; i < user.length; i++ ){
                        joData.push({
                            id: user[i].id,
                            name: user[i].name,
                            nip: user[i].nip
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