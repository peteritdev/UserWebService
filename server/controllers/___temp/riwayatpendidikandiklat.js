const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

var config = require('../config/config.json');

const modelPendidikanDiklat = require('../models').users_pendidikan_diklat;
const modelNamaDiklat = require('../models').db_nama_diklat;

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
                        modelJob = modelPendidikanDiklat;
                        filterJob = {
                            "user_id":decryptedId
                        };
                    }
                    return modelJob.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$diklat.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                }
                            ],
                            [Op.and]:[filterJob]
                        },
                        include:[{
                            model: modelNamaDiklat,
                            as: 'diklat'
                        }]
                    })
                    .then( data => {
                        modelJob.findAll({
                            where: {
                                [Op.or]:[
                                    {
                                        '$diklat.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ],
                                [Op.and]:[filterJob]
                            },
                            include:[{
                                model: modelNamaDiklat,
                                as: 'diklat'
                            }],
                            limit: limit,
                            offset: offset,
                        })
                        .then( riwayatPendidikanDiklat => {

                            for( var i = 0; i < riwayatPendidikanDiklat.length; i++ ){

                                libUtil.getEncrypted( (riwayatPendidikanDiklat[i].id).toString(), function(ecnryptedData){
                                    
                                    libUtil.getEncrypted( (riwayatPendidikanDiklat[i].user_id).toString(), function(ecnryptedUserData){

                                        //var filePengalaman = '<a href="' + config.frontParam.filePath.pengalamanKerja + jobExperience[i].upload_pengalaman +'">Download</a>';
                                        var status = '';
                                        var navigation = '';

                                        if( riwayatPendidikanDiklat[i].approved == 0 ){
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
                                            nama_diklat: riwayatPendidikanDiklat[i].diklat.name,
                                            tempat: riwayatPendidikanDiklat[i].tempat,                                            
                                            tanggal_mulai: riwayatPendidikanDiklat[i].tanggal_mulai,
                                            penyelenggara: riwayatPendidikanDiklat[i].penyelenggara,
                                            angkatan: riwayatPendidikanDiklat[i].angkatan,
                                            tahun: riwayatPendidikanDiklat[i].tahun,
                                            no_sttpp: riwayatPendidikanDiklat[i].no_sttpp,
                                            tanggal_sttpp: riwayatPendidikanDiklat[i].tanggal_sttpp
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
