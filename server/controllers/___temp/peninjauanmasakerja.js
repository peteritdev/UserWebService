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

const modelPMK = require('../models').user_history_peninjauan_masa_kerja;
const modelJenisPMK = require('../models').db_jenis_pmk;

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
                    return modelPMK.findAndCountAll({
                        where :{
                            [Op.or]:[
                                {
                                    instansi_perusahaan:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    no_surat_keputusan:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    no_bkn:{
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                }
                            ],
                            [Op.and]:[
                                {
                                    user_id: decryptedId
                                }
                            ]
                        }
                    })
                    .then( data => {
                        modelPMK.findAll({
                            where :{
                                [Op.or]:[
                                    {
                                        instansi_perusahaan:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        no_surat_keputusan:{
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        no_bkn:{
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
                                model: modelJenisPMK,
                                as: 'jenisPMK'
                            }],
                            limit: limit,
                            offset: offset,
                        })
                        .then( pmk => {
                            if( pmk.length > 0 ){
                                for( var i = 0; i < pmk.length; i++ ){
                                    libUtil.getEncrypted( (pmk[i].id).toString(), function( encryptedData ){
                                        //var linkEditPMK =  '<a href="#" name="link-modal-update" class="btn btn-primary btn-md" data-toggle="modal" data-target="#modal-form" data="' + encryptedData + '"><i class="glyphicon glyphicon-edit"></i></button>';
                                        var linkUploadSK = '<a href="#" name="link-modal-upload-sk-pmk" class="btn btn-warning btn-md" data-toggle="modal" data-target="#modal-upload-sk-pmk" data-edit="' + encryptedData + '"><i class="glyphicon glyphicon-upload"></i></a>';
                                        var columnSKVal = '';

                                        if( pmk[i].file_sk != '' && pmk[i].file_sk != null ){
                                            // Version 1:
                                            //linkUploadSK = linkUploadSK + ' <a href="' + config.frontParam.filePath.fileSKPMK + pmk[i].file_sk + '" class="btn btn-primary btn-md"><i class="glyphicon glyphicon-download"></i>&nbsp;Download</button>';
                                            // Version 2:
                                            columnSKVal = '<a href="' + config.frontParam.filePath.fileSKPMK + pmk[i].file_sk + '">' + pmk[i].no_surat_keputusan + '</a>';
                                        }else{
                                            columnSKVal = pmk[i].no_surat_keputusan;
                                        }

                                        /*var dataEdit = encryptedData + config.frontParam.separatorData + 
                                                    ( pmk[i].user_id == null ? '' : pmk[i].user_id ) + config.frontParam.separatorData + 
                                                    ( pmk[i].jenis_pmk_id == null ? '' : pmk[i].jenis_pmk_id ) + config.frontParam.separatorData + 
                                                    ( pmk[i].is_pengurangan_masa_kerja == null ? '' : pmk[i].is_pengurangan_masa_kerja ) + config.frontParam.separatorData + 
                                                    ( pmk[i].instansi_perusahaan == null ? '' : pmk[i].instansi_perusahaan ) + config.frontParam.separatorData + 
                                                    ( pmk[i].tgl_awal !== null && pmk[i].tgl_awal !== "" && pmk[i].tgl_awal !== "0000-00-00" ? dateFormat(pmk[i].tgl_awal, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                    ( pmk[i].tgl_akhir !== null && pmk[i].tgl_akhir !== "" && pmk[i].tgl_akhir !== "0000-00-00" ? dateFormat(pmk[i].tgl_akhir, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                    ( pmk[i].no_surat_keputusan == null ? '' : pmk[i].no_surat_keputusan ) + config.frontParam.separatorData + 
                                                    ( pmk[i].tgl_sk !== null && pmk[i].tgl_sk !== "" && pmk[i].tgl_sk !== "0000-00-00" ? dateFormat(pmk[i].tgl_sk, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                    ( pmk[i].masa_kerja_tahun == null ? '' : pmk[i].masa_kerja_tahun ) + config.frontParam.separatorData + 
                                                    ( pmk[i].masa_kerja_bulan == null ? '' : pmk[i].masa_kerja_bulan ) + config.frontParam.separatorData + 
                                                    ( pmk[i].no_bkn == null ? '' : pmk[i].no_bkn ) + config.frontParam.separatorData + 
                                                    ( pmk[i].tgl_bkn !== null && pmk[i].tgl_bkn !== "" && pmk[i].tgl_bkn !== "0000-00-00" ? dateFormat(pmk[i].tgl_bkn, "dd-mm-yyyy") : "") + config.frontParam.separatorData;
                                        */

                                        joData.push({
                                            jenis_pmk:{
                                                id: ( pmk[i].jenisPMK !== null ? pmk[i].jenisPMK.id : 0 ),
                                                name: ( pmk[i].jenisPMK !== null ? pmk[i].jenisPMK.name : "" ),
                                            },
                                            tgl_awal: ( pmk[i].tgl_awal !== null && pmk[i].tgl_awal !== "" && pmk[i].tgl_awal !== "0000-00-00" ? dateFormat(pmk[i].tgl_awal, "dd-mm-yyyy") : ""),
                                            tgl_akhir: ( pmk[i].tgl_akhir !== null && pmk[i].tgl_akhir !== "" && pmk[i].tgl_akhir !== "0000-00-00" ? dateFormat(pmk[i].tgl_akhir, "dd-mm-yyyy") : ""),
                                            instansi_perusahaan: ( pmk[i].instansi_perusahaan == null ? '' : pmk[i].instansi_perusahaan ),
                                            no_surat_keputusan: ( pmk[i].no_surat_keputusan == null ? '' : columnSKVal ),
                                            tgl_sk: ( pmk[i].tgl_sk !== null && pmk[i].tgl_sk !== "" && pmk[i].tgl_sk !== "0000-00-00" ? dateFormat(pmk[i].tgl_sk, "dd-mm-yyyy") : ""),
                                            masa_kerja: ( pmk[i].masa_kerja_tahun == null ? '' : pmk[i].masa_kerja_tahun.toString() + " tahun" ) + " " + ( pmk[i].masa_kerja_tahun == null ? '' : pmk[i].masa_kerja_bulan.toString() + " bulan" ),
                                            
                                            no_bkn: ( pmk[i].no_bkn == null ? '' : pmk[i].no_bkn ),  
                                            tgl_bkn: ( pmk[i].tgl_bkn !== null && pmk[i].tgl_bkn !== "" && pmk[i].tgl_bkn !== "0000-00-00" ? dateFormat(pmk[i].tgl_bkn, "dd-mm-yyyy") : ""),
                                            data_edit: '',
                                            link_upload_sk: linkUploadSK
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

    },

    save( req, res ){

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

    uploadSK( req, res ){
		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{
				libUtil.getDecrypted( req.body.id, function(decryptedId){                   

					modelPMK.update({
						file_sk: req.body.file_name
					},{
						where:{
							id: decryptedId
						}
					})
					.then( () => {
						joResult = JSON.stringify({
							"status_code": "00",
							"status_msg": "Upload file SK berhasil."
						});
						res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
					} )
					.catch( error => res.status(400).send(error) );
				});
			}
		});
	}

}

