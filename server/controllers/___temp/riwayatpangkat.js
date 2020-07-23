const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const dateFormat = require('dateformat');

var config = require('../config/config.json');

const modelRiwayatPangkat = require('../models').user_history_pangkat;
const modelPangkat = require('../models').db_pangkat;
const modelJenisKenaikanPangkat = require('../models').db_kenaikan_pangkat;
const modelGolongan = require('../models').db_golongan;

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
                        modelJob = modelRiwayatPangkat;
                        filterJob = {
                            "user_id":decryptedId
                        };
                    }
                    return modelJob.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    no_nota:{
                                        [Op.like]:'%' + keyword + '%'
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
                        order:[
                            ['tmt_golongan','DESC']
                        ]
                    })
                    .then( data => {
                        modelJob.findAll({
                            where: {
                                [Op.or]:[
                                    {
                                        no_nota:{
                                            [Op.like]:'%' + keyword + '%'
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
                            include:[
                                {
                                    model: modelPangkat,
                                    as: 'pangkat'
                                },
                                {
                                    model: modelJenisKenaikanPangkat,
                                    as: 'kenaikanPangkat'
                                },
                                {
                                    model: modelGolongan,
                                    as: 'golongan'
                                }
                            ],
                            limit: limit,
                            offset: offset,
                            order:[
                            ['tmt_golongan','DESC']
                        ]
                        })
                        .then( riwayatPangkat => {

                            for( var i = 0; i < riwayatPangkat.length; i++ ){

                                libUtil.getEncrypted( (riwayatPangkat[i].id).toString(), function(ecnryptedData){
                                    
                                    libUtil.getEncrypted( (riwayatPangkat[i].user_id).toString(), function(ecnryptedUserData){

                                        //var filePengalaman = '<a href="' + config.frontParam.filePath.pengalamanKerja + jobExperience[i].upload_pengalaman +'">Download</a>';
                                        var status = '';
                                        var navigation = '';

                                        if( riwayatPangkat[i].approved == 0 ){
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
                                            //tgl_mulai_kerja: jobExperience.tgl_mulai_kerja,
                                            no_stlud: riwayatPangkat[i].no_stlud,
                                            tgl_stlud: riwayatPangkat[i].tgl_stlud,
                                            golongan: {
                                                id: ( riwayatPangkat[i].golongan == null ? '' : riwayatPangkat[i].golongan.id ),
                                                name: ( riwayatPangkat[i].golongan == null ? '' : riwayatPangkat[i].golongan.name ),
                                            },
                                            pangkat:{
                                                id: ( riwayatPangkat[i].pangkat == null ? '' : riwayatPangkat[i].pangkat.id ),
                                                name: ( riwayatPangkat[i].pangkat == null ? '' : riwayatPangkat[i].pangkat.name ),
                                            },
                                            tmt_golongan: ( riwayatPangkat[i].tmt_golongan !== null && riwayatPangkat[i].tmt_golongan !== "" && riwayatPangkat[i].tmt_golongan !== "0000-00-00" ? dateFormat(riwayatPangkat[i].tmt_golongan, "dd-mm-yyyy") : ""),
                                            tmt_pangkat: riwayatPangkat[i].tmt_pangkat,
                                            no_nota: riwayatPangkat[i].no_nota,
                                            tgl_nota: riwayatPangkat[i].tgl_nota,
                                            no_sk: riwayatPangkat[i].no_sk,
                                            tgl_sk: riwayatPangkat[i].tgl_sk,
                                            jenis_kp:{
                                                id: ( riwayatPangkat[i].kenaikanPangkat == null ? '' : riwayatPangkat[i].kenaikanPangkat.id ),
                                                name: ( riwayatPangkat[i].kenaikanPangkat == null ? '' : riwayatPangkat[i].kenaikanPangkat.name ),
                                            },
                                            masa_kerja_thn: ( riwayatPangkat[i].masa_kerja_thn == null ? '' : riwayatPangkat[i].masa_kerja_thn ),
                                            masa_kerja_bln: ( riwayatPangkat[i].masa_kerja_bln == null ? '' : riwayatPangkat[i].masa_kerja_bln )
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
