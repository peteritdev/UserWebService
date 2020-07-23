const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const dateFormat = require('dateformat');

var config = require('../config/config.json');

const modelPendidikanUmum = require('../models').users_pendidikan_umum;

const jwtAuth = require('../libraries/jwt/jwtauth.js');
const libUtil = require('../libraries/utility.js');

module.exports = {

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
                        /*modelJob = modelJobExperiencePending;
                        filterJob = {
                            "user_id":decryptedId,
                            "approved": 0
                        };*/
                    }else{
                        modelJob = modelPendidikanUmum;
                        filterJob = {
                            "user_id":decryptedId
                        };
                    }
                    return modelJob.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    pendidikan_nama:{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    jurusan_nama: {
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    nama_sekolah: {
                                        [Op.like]: '%' + keyword + '%'
                                    }
                                },
                                {
                                    no_sttb: {
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
                                        pendidikan_nama:{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        jurusan_nama: {
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        nama_sekolah: {
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    },
                                    {
                                        no_sttb: {
                                            [Op.like]: '%' + keyword + '%'
                                        }
                                    }
                                ],
                                [Op.and]:[filterJob]
                            },
                            limit: limit,
                            offset: offset,
                        })
                        .then( riwayatTingkatPendidikan => {

                            for( var i = 0; i < riwayatTingkatPendidikan.length; i++ ){

                                libUtil.getEncrypted( (riwayatTingkatPendidikan[i].id).toString(), function(ecnryptedData){
                                    
                                    libUtil.getEncrypted( (riwayatTingkatPendidikan[i].user_id).toString(), function(ecnryptedUserData){

                                        //var filePengalaman = '<a href="' + config.frontParam.filePath.pengalamanKerja + jobExperience[i].upload_pengalaman +'">Download</a>';
                                        var status = '';
                                        var navigation = '';

                                        if( riwayatTingkatPendidikan[i].approved == 0 ){
                                            status = '<small class="label pull-left bg-yellow">Menunggu</small>';
                                            navigation = '<a href="#" data-toggle="modal" data-target="#modal-confirm-jobexperience" class="btn btn-success" name="link-approve-jobexperience" data="' + ecnryptedData + '|' + ecnryptedUserData + '"><i class="glyphicon glyphicon-ok"></i></a>' + 
                                                        '&nbsp;' + 
                                                        '<a href="#" data-toggle="modal" data-target="#modal-confirm-jobexperience" class="btn btn-danger" name="link-reject-jobexperience" data="' + ecnryptedData + '|' + ecnryptedUserData + '"><i class="glyphicon glyphicon-remove"></i></a>';
                                        }else{
                                            /*
                                            var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                              ecnryptedUserData + config.frontParam.separatorData +  
                                                              jobExperience[i].instansi + config.frontParam.separatorData + 
                                                              jobExperience[i].jabatan + config.frontParam.separatorData +  
                                                              jobExperience[i].tgl_mulai_thn + config.frontParam.separatorData + 
                                                              jobExperience[i].tgl_mulai_bln;
                                            status = '<small class="label pull-left bg-green">Aktif</small>';
                                            navigation = '<a href="#" data-toggle="modal" data-target="#modal-frm-job-experience" class="btn bg-navy" name="link-edit-jobexperience" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                            */
                                        }

                                        joData.push({
                                            index: (i+1),
                                            pendidikan_nama: riwayatTingkatPendidikan[i].pendidikan_nama,
                                            jurusan_nama: riwayatTingkatPendidikan[i].jurusan_nama,
                                            nama_sekolah: riwayatTingkatPendidikan[i].nama_sekolah,
                                            alamat_sekolah: riwayatTingkatPendidikan[i].alamat_sekolah,
                                            no_sttb: riwayatTingkatPendidikan[i].no_sttb,
                                            tgl_kelulusan: ( riwayatTingkatPendidikan[i].tgl_sttb !== null && riwayatTingkatPendidikan[i].tgl_sttb !== "" && riwayatTingkatPendidikan[i].tgl_sttb !== "0000-00-00" ? dateFormat(riwayatTingkatPendidikan[i].tgl_sttb, "dd-mm-yyyy") : ""),
                                            tahun_kelulusan: riwayatTingkatPendidikan[i].tahun_kelulusan
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
