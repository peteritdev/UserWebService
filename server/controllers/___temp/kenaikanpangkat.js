const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

var config = require('../config/config.json');

const modelRiwayatPangkat = require('../models').user_history_pangkat;
const modelRiwayatPangkatPending = require('../models').user_history_pangkat_pending;
const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

    save( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){
            var joAuth = JSON.parse( data );
            var joResult;
            var decryptedId;

			if( joAuth.status_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

                libUtil.getDecrypted( req.body.user_id, function( decryptedUserId ){

                    if( req.body.id === '' ){
                        decryptedId = 0;
                    }else{
                        libUtil.getDecrypted( req.body.id, function( decrypted ){
                            decryptedId = decrypted;
                        });
                    }                    

                    return modelRiwayatPangkatPending
                            .create({
                                user_id: decryptedUserId,
                                stlud_id: req.body.stlud_id,
                                no_stlud: req.body.no_stlud,
                                tgl_stlud: req.body.tgl_stlud,
                                pangkat_id: req.body.pangkat_id,
                                tmt_pangkat: req.body.tmt_pangkat,
                                no_nota: req.body.no_nota,
                                tgl_nota: req.body.tgl_nota,
                                no_sk: req.body.tgl_sk,
                                pejabat_penetap_id: req.body.pejabat_penetap_id,
                                jenis_kp_id: req.body.kp_id,
                                kredit: req.body.kredit,
                                masa_kerja_thn: req.body.masa_kerja_thn,
                                masa_kerja_bln: req.body.masa_kerja_bln,
                                keterangan: req.body.keterangan,
                                riwayat_pangkat: req.body.riwayat_pangkat,
                                ref_id: decryptedId
                            })
                            .then( modelJobExperiencePending => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Data riwayat pangkat berhasil disimpan. Silahkan tunggu konfirmasi dari admin."
                                });
        
                                res.setHeader('Content-Type','application/json');
                                res.status(201).send(joResult);
                            } );
                } );
                
            }
        });
    },

    confirmApprove( req, res ){
        jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				libUtil.getCurrDateTime(function(currTime){
					//console.log("USER ID :" + req.body.id);
					libUtil.getDecrypted( req.body.id, function(decryptedId){
                        libUtil.getDecrypted( req.body.user_id, function(decryptedUserId){
                            libUtil.getCurrDateTime(function(currTime){
                                return modelRiwayatPangkatPending
                                    .findOne({
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( data => {

                                        var historyStatus = 0;

                                        if( data == null ){
                                            joResult = JSON.stringify({
                                                "status_code": "-99",
                                                "status_msg": "Pending data not found."
                                            });
                                            res.setHeader('Content-Type','application/json');
                                            res.status(400).send(joResult);
                                        }else{

                                            if( req.body.type == 'APPROVE' ){

                                                historyStatus = 1;
                                                var qWhere;

                                                if( data.ref_id == 0 ){
                                                    
                                                    modelRiwayatPangkat
                                                        .findOrCreate({
                                                            where:{
                                                                user_id: decryptedUserId
                                                            },
                                                            defaults:{
                                                                stlud_id: req.body.stlud_id,
                                                                no_stlud: req.body.no_stlud,
                                                                tgl_stlud: req.body.tgl_stlud,
                                                                pangkat_id: req.body.pangkat_id,
                                                                tmt_pangkat: req.body.tmt_pangkat,
                                                                no_nota: req.body.no_nota,
                                                                tgl_nota: req.body.tgl_nota,
                                                                no_sk: req.body.tgl_sk,
                                                                pejabat_penetap_id: req.body.pejabat_penetap_id,
                                                                jenis_kp_id: req.body.kp_id,
                                                                kredit: req.body.kredit,
                                                                masa_kerja_thn: req.body.masa_kerja_thn,
                                                                masa_kerja_bln: req.body.masa_kerja_bln,
                                                                keterangan: req.body.keterangan,
                                                                riwayat_pangkat: req.body.riwayat_pangkat,
                                                                approved: 1,
                                                                createdAt: currTime
                                                            }
                                                        })
                                                        .spread( (modelRiwayatPangkat, created) => {
                                                            if( created ){
                                                                historyStatus = 1;
                                                                    modelRiwayatPangkatPending.update({
                                                                        approved: historyStatus,
                                                                        approved_user_id: req.headers['x-id']
                                                                    },{
                                                                        where:{
                                                                            id: decryptedId
                                                                        }
                                                                    })
                                                                    .then( () => {
                                                                        joResult = JSON.stringify({
                                                                            "status_code": "00",
                                                                            "status_msg": "Riwayat Pangkat berhasil diterima"
                                                                        });
                                                                        res.setHeader('Content-Type','application/json');
                                                                        res.status(201).send(joResult);
                                                                    } );
                                                            }else{
                                                                
                                                            }
                                                        } );

                                                }else{

                                                    modelRiwayatPangkat.update({
                                                        stlud_id: req.body.stlud_id,
                                                        no_stlud: req.body.no_stlud,
                                                        tgl_stlud: req.body.tgl_stlud,
                                                        pangkat_id: req.body.pangkat_id,
                                                        tmt_pangkat: req.body.tmt_pangkat,
                                                        no_nota: req.body.no_nota,
                                                        tgl_nota: req.body.tgl_nota,
                                                        no_sk: req.body.tgl_sk,
                                                        pejabat_penetap_id: req.body.pejabat_penetap_id,
                                                        jenis_kp_id: req.body.kp_id,
                                                        kredit: req.body.kredit,
                                                        masa_kerja_thn: req.body.masa_kerja_thn,
                                                        masa_kerja_bln: req.body.masa_kerja_bln,
                                                        keterangan: req.body.keterangan,
                                                        riwayat_pangkat: req.body.riwayat_pangkat,
                                                        approved: 1,
                                                        updatedAt: currTime
                                                    },{
                                                        where:{
                                                            id: data.ref_id
                                                        }
                                                    })
                                                    .then( () => {

                                                        historyStatus = 1;
                                                        modelRiwayatPangkatPending.update({
                                                            approved: historyStatus,
                                                            approved_user_id: req.headers['x-id']
                                                        },{
                                                            where:{
                                                                id: decryptedId
                                                            }
                                                        })
                                                        .then( () => {
                                                            joResult = JSON.stringify({
                                                                "status_code": "00",
                                                                "status_msg": "Riwayat Pangkat berhasil diterima"
                                                            });
                                                            res.setHeader('Content-Type','application/json');
                                                            res.status(201).send(joResult);
                                                        } );                                                           
                                                    } );

                                                }                                         

                                                
                                            }else if( req.body.type == 'REJECT' ){
                                                historyStatus = -1;
                                                modelRiwayatPangkatPending.update({
                                                    approved: historyStatus,
                                                    approved_user_id: req.headers['x-id']
                                                },{
                                                    where:{
                                                        id: decryptedId
                                                    }
                                                })
                                                .then( () => {
                                                    joResult = JSON.stringify({
                                                        "status_code": "00",
                                                        "status_msg": "Riwayat Pangkat berhasil ditolak"
                                                    });
                                                    res.setHeader('Content-Type','application/json');
                                                    res.status(201).send(joResult);
                                                } );                                                
                                            }

                                            

                                        }
                                    } );
                            });

                        });
                    });

                });

            }

        });
    },

    list(req,res){
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
                var id = req.query.id;
                var type = req.query.type;

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    var modelJob;
                    var filterJob;

                    if( type == 'PENDING' ){
                        modelJob = modelRiwayatPangkatPending;
                        filterJob = {
                            "user_id":decryptedId,
                            "approved": 0
                        };
                    }else{
                        modelJob = modelRiwayatPangkat;
                        filterJob = {
                            "user_id":decryptedId
                        };
                    }
                    return modelJob.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    no_stlud:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    no_nota: {
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    no_sk: {
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                }
                            ],
                            [Op.and]:[filterJob]
                        }
                    })
                    .then( data => {
                        modelJob.findAll({
                            where: {
                                [Op.or]:[
                                    {
                                        no_stlud:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        no_nota: {
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        no_sk: {
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    }
                                ],
                                [Op.and]:[filterJob]
                            },
                            limit: limit,
                            offset: offset,
                        })
                        .then( historyPangkat => {

                            for( var i = 0; i < historyPangkat.length; i++ ){

                                libUtil.getEncrypted( (historyPangkat[i].id).toString(), function(ecnryptedData){
                                    
                                    libUtil.getEncrypted( (historyPangkat[i].user_id).toString(), function(ecnryptedUserData){

                                        /*baru sampe sini*/
                                        var filePengalaman = '<a href="' + config.frontParam.filePath.pengalamanKerja + jobExperience[i].upload_pengalaman +'">Download</a>';
                                        var status = '';
                                        var navigation = '';

                                        if( jobExperience[i].approved == 0 ){
                                            status = '<small class="label pull-left bg-yellow">Menunggu</small>';
                                            navigation = '<a href="#" data-toggle="modal" data-target="#modal-confirm-jobexperience" class="btn btn-success" name="link-approve-jobexperience" data="' + ecnryptedData + '|' + ecnryptedUserData + '"><i class="glyphicon glyphicon-ok"></i></a>' + 
                                                        '&nbsp;' + 
                                                        '<a href="#" data-toggle="modal" data-target="#modal-confirm-jobexperience" class="btn btn-danger" name="link-reject-jobexperience" data="' + ecnryptedData + '|' + ecnryptedUserData + '"><i class="glyphicon glyphicon-remove"></i></a>';
                                        }else{
                                            var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                              ecnryptedUserData + config.frontParam.separatorData +  
                                                              jobExperience[i].instansi + config.frontParam.separatorData + 
                                                              jobExperience[i].jabatan + config.frontParam.separatorData +  
                                                              jobExperience[i].tgl_mulai_thn + config.frontParam.separatorData + 
                                                              jobExperience[i].tgl_mulai_bln;
                                            status = '<small class="label pull-left bg-green">Aktif</small>';
                                            navigation = '<a href="#" data-toggle="modal" data-target="#modal-frm-job-experience" class="btn bg-navy" name="link-edit-jobexperience" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        }

                                        joData.push({
                                            index: (i+1),
                                            //tgl_mulai_kerja: jobExperience.tgl_mulai_kerja,
                                            instansi: jobExperience[i].instansi,
                                            jabatan: jobExperience[i].jabatan,
                                            tgl_mulai_thn: jobExperience[i].tgl_mulai_thn,
                                            tgl_mulai_bln: jobExperience[i].tgl_mulai_bln,
                                            upload_pengalaman: filePengalaman,
                                            status: status,
                                            created_at: jobExperience[i].createdAt,                                            
                                            navigation: navigation
                                        });

                                    });

                                } );

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