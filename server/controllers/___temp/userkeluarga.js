const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const bcrypt = require('bcryptjs');
const dateFormat = require('dateformat');
var config = require('../config/config.json');
const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

const modelUser = require('../models').users;
const modelUserKeluarga = require('../models').user_keluarga;
const modelStatusPernikahan = require('../models').db_status_pernikahan;

const modelJenisKelamin = require('../models').db_jenis_kelamin;

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
				var offset = parseInt(req.query.offset);
				var limit = parseInt(req.query.limit);
                var draw = req.query.draw;
                var relationType = req.query.type;
                var id = req.query.id;

                var joData = [];
                var filterRelationType;             

                libUtil.getDecrypted( req.query.id, function(decryptedId){



                    /*if( relationType == 1 ){
                        filterRelationType = {
                            "relasi_id": {
                                [Op.in]: [1,2]
                            }
                        };
                    }else */
                    if( relationType == 2 ){
                        filterRelationType = {
                            "relasi_id": {
                                [Op.in]: [1,2,4,5]
                            },
                            [Op.and]:[
                                {
                                    user_id: decryptedId
                                }
                            ]
                        };
                    }else if( relationType == 3 ){

                        libUtil.getDecrypted( req.query.parent_user_family_id, function(decryptedParentUserFamilyId){
                            filterRelationType = {
                                "relasi_id": {
                                    [Op.in]: [3]                                    
                                },
                                [Op.and]:[
                                    {
                                        user_id: decryptedId,
                                        parent_user_family_id: decryptedParentUserFamilyId
                                    }
                                ]
                            };
                        });
                    }
                
                    return modelUserKeluarga.findAndCountAll({
                        where:{
                            [Op.and]:[filterRelationType]
                        },
                    })
                    .then( data => {
                        modelUserKeluarga.findAll({
                            where: {
                                [Op.and]:[filterRelationType]
                            },
                            include:[
                                {
                                    model: modelUser,
                                    as: 'userKeluarga',
                                    include:[
                                        {
                                            model: modelStatusPernikahan,
                                            as: 'statusPernikahan'
                                        },
                                        {
                                            model: modelJenisKelamin,
                                            as: 'jenisKelamin'
                                        }
                                    ]
                                }
                            ],
                            limit: limit,
                            offset: offset,
                        })
                        .then( user => {
                            for( var i = 0; i < user.length; i++ ){
                                libUtil.getEncrypted( (user[i].id).toString(), function( encryptedId ){
                                    libUtil.getEncrypted( (user[i].user_family_id).toString(), function( encryptedUserFamilyId ){
                                        var dataEdit = "";
                                        var linkName = "";
                                        var linkAnak = "";
                                        var linkEdit = "";
                                        if( user[i].userKeluarga !== null ){
                                            dataEdit = encryptedUserFamilyId + config.frontParam.separatorData + 
                                                        ( user[i].userKeluarga.name !== null ? user[i].userKeluarga.name : "" ) + config.frontParam.separatorData + 
                                                        ( user[i].relasi_id !== null ? user[i].relasi_id : 0 ) + config.frontParam.separatorData + 
                                                        ( user[i].tgl_menikah !== null && user[i].tgl_menikah !== "" && user[i].tgl_menikah !== "0000-00-00" ? dateFormat(user[i].tgl_menikah, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                        ( user[i].akte_menikah == null ? "" : user[i].akte_menikah ) + config.frontParam.separatorData + 
                                                        ( user[i].tgl_cerai !== null && user[i].tgl_cerai !== "" && user[i].tgl_cerai !== "0000-00-00" ? dateFormat(user[i].tgl_cerai, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                        ( user[i].akte_cerai == null ? "" : user[i].akte_cerai ) + config.frontParam.separatorData + 
                                                        ( user[i].userKeluarga.is_pns !== null ? user[i].userKeluarga.is_pns : 0 ) + config.frontParam.separatorData +
                                                        encryptedId;

                                            if( relationType == 2 ){
                                                linkName = '<a href="#" name="link-nama-suamiistri" data-toggle="modal" data-target="#modal-frm-add-edit" data-edit="' + dataEdit + '">' + user[i].userKeluarga.name + '</a>';
                                                linkEdit = '<a href="#" class="btn bg-blue" data-toggle="modal" data-target="#modal-frm-add-user" data-edit="' + encryptedUserFamilyId + '" name="link-edit-suamiistri">' + 
                                                                        '<span class="glyphicon glyphicon-edit fa-1x"></span>' + 
                                                                    '</a>';
                                            }else if( relationType == 3 ){

                                                if( user[i].parent_user_family_id !== null ){
                                                    libUtil.getEncrypted( (user[i].parent_user_family_id).toString(), function( encryptedParentUserFamilyId ){
                                                        dataEdit += config.frontParam.separatorData + encryptedParentUserFamilyId + config.frontParam.separatorData + user[i].status_anak;
                                                        linkName = '<a href="#" name="link-nama-anak" data-toggle="modal" data-target="#modal-frm-add-edit" data-edit="' + dataEdit + '">' + user[i].userKeluarga.name + '</a>';
                                                        //linkName = '<a href="#" name="link-nama-suamiistri" data-toggle="modal" data-target="#modal-frm-add-edit" data-edit="' + dataEdit + '">' + user[i].userKeluarga.name + '</a>';
                                                        linkEdit = '<a href="#" class="btn bg-yellow" data-toggle="modal" data-target="#modal-form" data-edit="<?php echo $data_edit;?>" name="link-edit">' + 
                                                                        '<span class="glyphicon glyphicon-edit fa-1x"></span>' + 
                                                                    '</a>';
                                                    });
                                                }else{
                                                    
                                                        linkName = '';
                                                        //linkName = '<a href="#" name="link-nama-suamiistri" data-toggle="modal" data-target="#modal-frm-add-edit" data-edit="' + dataEdit + '">' + user[i].userKeluarga.name + '</a>';
                                                        linkEdit = '';
                                                }
                                                
                                            }
                                            
                                        }                                       
                                         
                                        if( user[i].userKeluarga !== null ){
                                            joData.push({
                                                relasi_id: user[i].relasi_id,
                                                relasi_name: libUtil.getRelasiName(user[i].relasi_id),
                                                name: linkName,
                                                status_hidup: user[i].userKeluarga.status_hidup,
                                                status_hidup_name: ( user[i].userKeluarga.status_hidup == 1 ? 'HIDUP' : 'MENINGGAL' ),
                                                status_pernikahan_id: user[i].userKeluarga.status_pernikahan_id,
                                                status_pernikahan_name: ( user[i].userKeluarga.statusPernikahan !== null ? user[i].userKeluarga.statusPernikahan.name : "" ),
                                                is_pns: ( user[i].userKeluarga.is_pns == 1 ? 'YA' : 'TIDAK'),
                                                jenis_kelamin: {
                                                    id: ( user[i].userKeluarga.jenisKelamin !== null ? user[i].userKeluarga.jenisKelamin.id : 0 ),
                                                    name: ( user[i].userKeluarga.jenisKelamin !== null ? user[i].userKeluarga.jenisKelamin.name : "" ) ,
                                                },
                                                tempat_lahir: user[i].userKeluarga.tempat_lahir,
                                                tanggal_lahir: ( user[i].userKeluarga.tanggal_lahir !== null && user[i].userKeluarga.tanggal_lahir !== "" && user[i].userKeluarga.tanggal_lahir !== "0000-00-00" ? dateFormat(user[i].userKeluarga.tanggal_lahir, "dd-mm-yyyy") : ""),
                                                status_anak: user[i].status_anak,
                                                link_edit:linkEdit
                                            });

                                        }

                                    });

                                });
                            }
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
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

    },

    saveUser( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				var xTglLahir = "";
				if( req.body.tanggal_lahir != null && req.body.tanggal_lahir != "" ){
					xTglLahir = libUtil.parseToFormattedDate( req.body.tanggal_lahir );
				}
				
				var xTglMeninggal = "";
				if( req.body.tgl_meninggal != null && req.body.tgl_meninggal != "" ){
					xTglMeninggal = libUtil.parseToFormattedDate( req.body.tgl_meninggal );
				}

				var xTglNpwp = "";
				if( req.body.tgl_npwp != null && req.body.tgl_npwp != "" ){
					xTglNpwp = libUtil.parseToFormattedDate( req.body.tgl_npwp );
                }

                if( req.body.act == 'add' ){
                    return modelUser
                        .findOrCreate({
                            where:{
                                nik: req.body.nik
                            },
                            defaults: {
                                name: req.body.nama,
                                gelar_depan: req.body.gelar_depan,
                                gelar_belakang: req.body.gelar_belakang,
                                tempat_lahir: req.body.tempat_lahir,
                                tanggal_lahir: ( xTglLahir == "" ? null : xTglLahir ),
                                jenis_kelamin_id: req.body.jenis_kelamin_id,
                                agama_id: req.body.agama_id,
                                email: req.body.email,
                                alamat_tinggal: req.body.alamat,
                                no_hp: req.body.no_hp,
                                telepon: req.body.telepon,
                                status_pernikahan_id: req.body.status_pernikahan_id,
                                akte_kelahiran: req.body.akte_kelahiran,
                                status_hidup: req.body.status_hidup,
                                akte_meninggal: req.body.akte_meninggal,
                                tgl_meninggal: ( xTglMeninggal == "" ? null : xTglMeninggal ),
                                no_npwp: req.body.no_npwp,
                                tgl_npwp: ( xTglNpwp == "" ? null : xTglNpwp ),
                                status: 1,
                                status_hidup:1,
                                is_pns:0,
                                role_id: -1,
                                createdUser: parseInt(req.headers['x-id'])
                            }
                        })
                        .spread( (user, created) => {
                            if( created ){
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "User successfully created"
                                });
                            }else{
                                joResult = JSON.stringify({
                                    "status_code": "-99",
                                    "status_msg": "User already exists."
                                });
                            }
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        } )
                        /*.then( data => res.status(201).send( data ) )*/
                        .catch( error => res.status(400).send(error) );
                }else{

                    libUtil.getDecrypted( req.body.id, function(decryptedId){
                        return modelUser
                            .update({
                                name: req.body.nama,
                                gelar_depan: req.body.gelar_depan,
                                gelar_belakang: req.body.gelar_belakang,
                                tempat_lahir: req.body.tempat_lahir,
                                tanggal_lahir: ( xTglLahir == "" ? null : xTglLahir ),
                                jenis_kelamin_id: req.body.jenis_kelamin_id,
                                agama_id: req.body.agama_id,
                                email: req.body.email,
                                alamat_tinggal: req.body.alamat,
                                no_hp: req.body.no_hp,
                                telepon: req.body.telepon,
                                status_pernikahan_id: req.body.status_pernikahan_id,
                                akte_kelahiran: req.body.akte_kelahiran,
                                status_hidup: req.body.status_hidup,
                                akte_meninggal: req.body.akte_meninggal,
                                tgl_meninggal: ( xTglMeninggal == "" ? null : xTglMeninggal ),
                                no_npwp: req.body.no_npwp,
                                tgl_npwp: ( xTglNpwp == "" ? null : xTglNpwp ),
                                status: 1,
                                status_hidup:1,
                                is_pns:0,
                                role_id: -1,
                                modifiedUser: parseInt(req.headers['x-id'])
                            },                                
                            {
                                where:{
                                    id: decryptedId                                  
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Data successfully updated"
                                });
                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            } );

                    });
                }								

			}

		});

    },
    
    saveUserFamily( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                var xTglMenikah = "";
				if( req.body.tgl_menikah != null && req.body.tgl_menikah != "" ){
					xTglMenikah = libUtil.parseToFormattedDate( req.body.tgl_menikah );
                }
                
                var xTglCerai = "";
				if( req.body.tgl_cerai != null && req.body.tgl_cerai != "" ){
					xTglCerai = libUtil.parseToFormattedDate( req.body.tgl_cerai );
				}

                libUtil.getDecrypted( req.body.user_id, function(decryptedUserId){
                    libUtil.getDecrypted( req.body.user_family_id, function(decryptedUserFamilyId){

                        if( req.body.act == "add" ){
                            modelUserKeluarga
                                .findOrCreate({
                                    where:{
                                        user_id: decryptedUserId,
                                        user_family_id: decryptedUserFamilyId                                    
                                    },
                                    defaults:{
                                        relasi_id: req.body.relasi_id,
                                        tgl_menikah: ( xTglMenikah == "" ? null : xTglMenikah ),
                                        akte_menikah: req.body.akte_menikah,
                                        tgl_cerai: ( xTglCerai == "" ? null : xTglCerai ),
                                        akte_cerai: req.body.akte_cerai,
                                        is_pns: req.body.is_pns,
                                        createdUser: parseInt(req.headers['x-id'])
                                    }
                                })
                                .spread( ( user, created ) => {
                                    if( created ){
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data successfully created"
                                        });
                                    }else{
                                        joResult = JSON.stringify({
                                            "status_code": "-99",
                                            "status_msg": "Data already exists."
                                        });
                                    }
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
                        }else if( req.body.act == "edit" ){
                            libUtil.getDecrypted( req.body.id, function(decryptedId){
                                modelUserKeluarga
                                    .update({
                                        user_family_id: decryptedUserFamilyId,
                                        relasi_id: req.body.relasi_id,
                                        tgl_menikah: ( xTglMenikah == "" ? null : xTglMenikah ),
                                        akte_menikah: req.body.akte_menikah,
                                        tgl_cerai: ( xTglCerai == "" ? null : xTglCerai ),
                                        akte_cerai: req.body.akte_cerai,
                                        is_pns: req.body.is_pns,
                                        modifiedUser: parseInt(req.headers['x-id'])
                                    },                                
                                    {
                                        where:{
                                            id: decryptedId                                  
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data successfully updated"
                                        });
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    } );

                            });
                        }

                    });

                });
            }

        });

    },

    saveUserAnak( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                /*libUtil.writeLog(">>> Decrypted User ID : " + req.body.user_id);
                libUtil.writeLog(">>> Decrypted User Family ID : " + req.body.user_family_id);
                libUtil.writeLog(">>> Decrypted Parent User Family ID : " + req.body.parent_user_family_id);*/

                libUtil.getDecrypted( req.body.user_id, function(decryptedUserId){
                    libUtil.getDecrypted( req.body.user_family_id, function(decryptedUserFamilyId){
                        libUtil.getDecrypted( req.body.parent_user_family_id, function(decryptedParentUserFamilyId){
                            if( req.body.act == "add" ){
                                modelUserKeluarga
                                    .findOrCreate({
                                        where:{
                                            user_id: decryptedUserId,
                                            user_family_id: decryptedUserFamilyId                                    
                                        },
                                        defaults:{
                                            parent_user_family_id: decryptedParentUserFamilyId,
                                            relasi_id: req.body.relasi_id,
                                            status_anak: req.body.status_anak,
                                            createdUser: parseInt(req.headers['x-id'])
                                        }
                                    })
                                    .spread( ( user, created ) => {
                                        if( created ){
                                            joResult = JSON.stringify({
                                                "status_code": "00",
                                                "status_msg": "Data successfully created"
                                            });
                                        }else{
                                            joResult = JSON.stringify({
                                                "status_code": "-99",
                                                "status_msg": "Data already exists."
                                            });
                                        }
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    } );
                            }else if( req.body.act == "edit" ){
                                libUtil.getDecrypted( req.body.id, function(decryptedId){
                                    modelUserKeluarga
                                        .update({
                                            user_family_id: decryptedUserFamilyId,
                                            parent_user_family_id: decryptedParentUserFamilyId,
                                            relasi_id: req.body.relasi_id,                                        
                                            status_anak: req.body.status_anak,
                                            modifiedUser: parseInt(req.headers['x-id'])
                                        },                                
                                        {
                                            where:{
                                                id: decryptedId                                  
                                            }
                                        })
                                        .then( () => {
                                            joResult = JSON.stringify({
                                                "status_code": "00",
                                                "status_msg": "Data successfully updated"
                                            });
                                            res.setHeader('Content-Type','application/json');
                                            res.status(201).send(joResult);
                                        } );

                                });
                            }
                        });

                    });

                });
            }

        });

    },

    getSuamiIstri( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
                var keyword = req.query.keyword;
				var offset = parseInt(req.query.offset);
				var limit = parseInt(req.query.limit);
                var draw = req.query.draw;
                var relationType = req.query.type;
                var id = req.query.id;

                var joData = [];
                var filterRelationType;

                

                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    filterRelationType = {
                        "relasi_id": {
                            [Op.in]: [1,2]
                        },
                        "user_id": decryptedId
                    };
                
                    return modelUserKeluarga.findAndCountAll({
                        where:{
                            [Op.and]:[filterRelationType]
                        },
                    })
                    .then( data => {
                        modelUserKeluarga.findAll({
                            where: {
                                [Op.and]:[filterRelationType]
                            },
                            include:[
                                {
                                    model: modelUser,
                                    as: 'userKeluarga'
                                }
                            ]
                        })
                        .then( user => {
                            for( var i = 0; i < user.length; i++ ){
                                libUtil.getEncrypted( (user[i].id).toString(), function( encryptedId ){
                                    libUtil.getEncrypted( (user[i].user_family_id).toString(), function( encryptedUserFamilyId ){                                        
                                        joData.push({
                                            id: encryptedId,
                                            name: user[i].userKeluarga.name
                                        });
                                    });

                                });
                            }
                            joResult = JSON.stringify({
                                "status_code": "00",
                                "status_msg": "OK",
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

    },
    

}