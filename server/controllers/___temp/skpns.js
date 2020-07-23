const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const bcrypt = require('bcryptjs');

var config = require('../config/config.json');

const modelSkpns = require('../models').user_sk_pns;
const modelGolongan = require('../models').db_golongan;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    list( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
    
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;

            if( joAuth.status_code == '-99' ){
                res.setHeader('Content-Type','application/json');
                res.status(400).send(joAuth);
            }else{

                libUtil.getDecrypted( req.query.id, function(decrypted){
                    decryptedId = decrypted;
                });

                return modelSkpns.findOne({
                    where: {
                        user_id: decryptedId
                    }
                })
                .then( data => {
                    if( data == null ){
                        var joResult = JSON.stringify({
                            "status_code": "-99",
                            "status_msg": "User not found"
                        });
                        res.setHeader('Content-Type','application/json');
                        res.status(400).send(joResult);
                    }else{
                        var joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "OK",
                            "data":{
                                pejabat_penetapan_id: data.pejabat_penetapan_id,
                                nama_pejabat_penetapan: data.nama_pejabat_penetapan,
                                nip_pejabat_penetapan: data.nip_pejabat_penetapan,
                                no_surat_keputusan: data.no_surat_keputusan,
                                tgl_surat_keputusan: data.tgl_surat_keputusan,
                                terhitung_mulai_tanggal: data.terhitung_mulai_tanggal,
                                no_diklat_prajabatan: data.no_diklat_prajabatan,
                                tgl_diklat_prajabatan: data.tgl_diklat_prajabatan,
                                no_surat_uji_kesehatan: data.no_surat_uji_kesehatan,
                                tgl_surat_uji_kesehatan: data.tgl_surat_uji_kesehatan,
                                tgl_terbit_skck: data.tgl_terbit_skck,
                                golongan_ruang_id: data.golongan_ruang_id,
                                pengambilan_sumpah: data.pengambilan_sumpah,
                                sk_pns: data.sk_pns 
                            }
                        });

                        res.setHeader('Content-Type','application/json');
						res.status(201).send(joResult);
                    }
                } );

            }

        });

    },

    save( req, res ){

        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var currDateTime;
            var decryptedUserId;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                libUtil.getCurrDateTime(function(curr){
                    currDateTime = curr;
                });

                libUtil.getDecrypted( req.body.user_id, function(decrypted){
                    decryptedUserId = decrypted;
                });

                return modelSkpns
                    .findOrCreate({
                        where: {
                            user_id: decryptedUserId
                        },
                        defaults: {
                            pejabat_penetapan_id: req.body.pejabata_penetapan_id,
                            nama_pejabat_penetapan: req.body.nama_pejabat_penetapan,
                            nip_pejabat_penetapan: req.body.nip_pejabat_penetapan,
                            no_surat_keputusan: req.body.no_surat_keputusan,
                            tgl_surat_keputusan: ( req.body.tgl_surat_keputusan != null && req.body.tgl_surat_keputusan != "" ? req.body.tgl_surat_keputusan : null ),
                            terhitung_mulai_tanggal: ( req.body.terhitung_mulai_tanggal != null && req.body.terhitung_mulai_tanggal != "" ? req.body.terhitung_mulai_tanggal : null ),
                            no_diklat_prajabatan: req.body.no_diklat_prajabatan,
                            tgl_diklat_prajabatan: ( req.body.tgl_diklat_prajabatan != null && req.body.tgl_diklat_prajabatan != "" ? req.body.tgl_diklat_prajabatan : null ),
                            no_surat_uji_kesehatan: req.body.no_surat_uji_kesehatan,
                            tgl_surat_uji_kesehatan: ( req.body.tgl_surat_uji_kesehatan != null && req.body.tgl_surat_uji_kesehatan != "" ? req.body.tgl_surat_uji_kesehatan : null ),
                            golongan_ruang_id: req.body.golongan_ruang_id,
                            pengambilan_sumpah: req.body.pengambilan_sumpah,
                            sk_pns: req.body.sk_pns,
                            skck: req.body.skck,
                            createdAt:currDateTime
                        }
                    })
                    .spread(( skcpns, created ) => {
                        if( created ){
                            joResult = JSON.stringify({
								"status_code": "00",
								"status_msg": "SK-CPNS successfully created"
                            });
                            res.setHeader('Content-Type','application/json');
							res.status(201).send(joResult);
                        }else{
                            modelSkpns
                                .update({
                                    pejabat_penetapan_id: req.body.pejabata_penetapan_id,
                                    nama_pejabat_penetapan: req.body.nama_pejabat_penetapan,
                                    nip_pejabat_penetapan: req.body.nip_pejabat_penetapan,
                                    no_surat_keputusan: req.body.no_surat_keputusan,
                                    tgl_surat_keputusan: ( req.body.tgl_surat_keputusan != null && req.body.tgl_surat_keputusan != "" ? req.body.tgl_surat_keputusan : null ),
                                    terhitung_mulai_tanggal: ( req.body.terhitung_mulai_tanggal != null && req.body.terhitung_mulai_tanggal != "" ? req.body.terhitung_mulai_tanggal : null ),
                                    no_diklat_prajabatan: req.body.no_diklat_prajabatan,
                                    tgl_diklat_prajabatan: ( req.body.tgl_diklat_prajabatan != null && req.body.tgl_diklat_prajabatan != "" ? req.body.tgl_diklat_prajabatan : null ),
                                    no_surat_uji_kesehatan: req.body.no_surat_uji_kesehatan,
                                    tgl_surat_uji_kesehatan: ( req.body.tgl_surat_uji_kesehatan != null && req.body.tgl_surat_uji_kesehatan != "" ? req.body.tgl_surat_uji_kesehatan : null ),
                                    golongan_ruang_id: req.body.golongan_ruang_id,
                                    pengambilan_sumpah: req.body.pengambilan_sumpah,
                                    sk_pns: req.body.sk_pns,
                                    skck: req.body.skck,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        user_id: decryptedUserId
                                    }
                                })
                                .then(() => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "SK-PNS successfully updated"
                                    });
                                    res.setHeader('Content-Type','application/json');
									res.status(201).send(joResult);
                                })
                                .catch( error => res.status(400).send(error) );
						}
                    })
                    .catch( error => res.status(400).send(error) );

            }

        });

    }

}