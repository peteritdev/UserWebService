const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;

var config = require('../config/config.json');

const modelDP3 = require('../models').user_history_dp3;
const modelPangkat = require('../models').db_pangkat;
const modelUser = require('../models').users;
const modelJabatan = require('../models').db_jabatan;
const modelUnor = require('../models').db_unor;
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

                var joData = [];
                
                libUtil.getDecrypted( req.query.id, function(decryptedId){

                    return modelDP3.findAndCountAll({
                        where:{
                            /*[Op.or]:[
                                {
                                    '$pangkat.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    tahun: keyword
                                }
                            ],*/
                            [Op.and]:[{
                                "user_id":decryptedId
                            }]
                        },
                        include:[
                            {
                                model: modelPangkat,
                                as: 'pangkat'
                            },
                            {
                                model: modelUser,
                                as: 'pejabatPenilai',
                                include: [
                                    {
                                        model: modelJabatan,
                                        as: 'jabatan'
                                    },
                                    {
                                        model: modelUnor,
                                        as: 'unor'
                                    },
                                    {
                                        model: modelGolongan,
                                        as: 'golonganRuangAwal'
                                    }
                                ]
                            }
                        ]
                    })
                    .then( data => {
                        modelDP3.findAll({
                            where:{
                                /*[Op.or]:[
                                    {
                                        '$pangkat.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ],*/
                                [Op.and]:[{
                                    "user_id":decryptedId
                                }]
                            },
                            include:[
                                {
                                    model: modelPangkat,
                                    as: 'pangkat'
                                },
                                {
                                    model: modelUser,
                                    as: 'pejabatPenilai',
                                    include: [
                                        {
                                            model: modelJabatan,
                                            as: 'jabatan'
                                        },
                                        {
                                            model: modelUnor,
                                            as: 'unor'
                                        },
                                        {
                                            model: modelGolongan,
                                            as: 'golonganRuangAwal'
                                        }
                                    ]
                                }
                            ],                            
                            limit: limit,
                            offset: offset,
                        })
                        .then( dp3 => {

                            for( var i = 0; i < dp3.length; i++ ){

                                libUtil.getEncrypted( (dp3[i].id).toString(), function(ecnryptedData){                                    
                                    libUtil.getEncrypted( (dp3[i].user_id).toString(), function(ecnryptedUserData){
                                        libUtil.getEncrypted( (dp3[i].pejabat_penilai_id).toString(), function(ecnryptedPejabatPenilaiId){

                                            var status = '';
                                            var navigationEdit = '';
                                            var navigationDetail = '';
                                            var navigationDelete = '';

                                            var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                                ecnryptedUserData + config.frontParam.separatorData +  
                                                                dp3[i].pangkat_id + config.frontParam.separatorData + 
                                                                dp3[i].tahun + config.frontParam.separatorData +  
                                                                dp3[i].kesetiaan + config.frontParam.separatorData + 
                                                                dp3[i].kesetiaan_desc + config.frontParam.separatorData + 
                                                                dp3[i].tanggung_jawab + config.frontParam.separatorData + 
                                                                dp3[i].tanggung_jawab_desc + config.frontParam.separatorData + 
                                                                dp3[i].kejujuran + config.frontParam.separatorData + 
                                                                dp3[i].kejujuran_desc + config.frontParam.separatorData + 
                                                                dp3[i].prakarsa + config.frontParam.separatorData + 
                                                                dp3[i].prakarsa_desc + config.frontParam.separatorData + 
                                                                dp3[i].prestasi_kerja + config.frontParam.separatorData + 
                                                                dp3[i].prestasi_kerja_desc + config.frontParam.separatorData + 
                                                                dp3[i].ketaatan + config.frontParam.separatorData + 
                                                                dp3[i].ketaatan_desc + config.frontParam.separatorData + 
                                                                dp3[i].kerjasama + config.frontParam.separatorData + 
                                                                dp3[i].kerjasama_desc + config.frontParam.separatorData + 
                                                                dp3[i].kepemimpinan + config.frontParam.separatorData + 
                                                                dp3[i].kepemimpinan_desc + config.frontParam.separatorData + 
                                                                dp3[i].jumlah + config.frontParam.separatorData + 
                                                                dp3[i].nilai_rata_rata + config.frontParam.separatorData + 
                                                                dp3[i].nilai_desc + config.frontParam.separatorData + 
                                                                ( dp3[i].pejabatPenilai !== null ? ecnryptedPejabatPenilaiId : '' ) + config.frontParam.separatorData +
                                                                ( dp3[i].pejabatPenilai !== null && dp3[i].pejabat_penilai_id != 0 ? dp3[i].pejabatPenilai.name : '' ) ;
                                            status = '<small class="label pull-left bg-green">Aktif</small>';
                                            navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-dp3" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                            navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-dp3" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                            navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-dp3" class="btn bg-red" name="link-delete-dp3" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';

                                            joData.push({
                                                index: (i+1),
                                                tahun: dp3[i].tahun,
                                                nilai_rata: dp3[i].nilai_rata_rata,
                                                nilai_desc: dp3[i].nilai_desc,
                                                jumlah: dp3[i].jumlah,     
                                                pejabat_penilai: ( dp3[i].pejabatPenilai == null ? '' : dp3[i].pejabatPenilai.name ), 
                                                atasan_pejabat_penilai: ( dp3[i].atasanPejabatPenilai == null ? '' : dp3[i].atasanPejabatPenilai.name ),                                 
                                                navigation: ( navigationEdit + '&nbsp;' + navigationDelete )
                                            });
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

                    /*if( req.body.id === '' ){
                        decryptedId = 0;
                    }else{
                        libUtil.getDecrypted( req.body.id, function( decrypted ){
                            decryptedId = decrypted;
                        });
                    }*/                    

                    if( req.body.act == 'add' ){
                        libUtil.getCurrDateTime(function(currTime){
                            return modelDP3
                                .create({
                                    user_id: decryptedUserId,
                                    pangkat_id: req.body.pangkat_id,
                                    tahun: req.body.tahun,
                                    kesetiaan: ( req.body.kesetiaan !== '' && req.body.kesetiaan !== null ? req.body.kesetiaan : 0 ),
                                    kesetiaan_desc: req.body.kesetiaan_desc,
                                    tanggung_jawab: ( req.body.tanggung_jawab !== '' && req.body.tanggung_jawab !== null ? req.body.tanggung_jawab : 0 ),
                                    tanggung_jawab_desc: req.body.tanggung_jawab_desc,
                                    kejujuran: ( req.body.kejujuran !== '' && req.body.kejujuran !== null ? req.body.kejujuran : 0 ),
                                    kejujuran_desc: req.body.kejujuran_desc,
                                    prakarsa: ( req.body.prakarsa !== '' && req.body.prakarsa !== null ? req.body.prakarsa : 0 ),
                                    prakarsa_desc: req.body.prakarsa_desc,
                                    prestasi_kerja: ( req.body.prestasi_kerja !== '' && req.body.prestasi_kerja !== null ? req.body.prestasi_kerja : 0 ),
                                    prestasi_kerja_desc: req.body.prestasi_kerja_desc,
                                    ketaatan: ( req.body.ketaatan !== '' && req.body.ketaatan !== null ? req.body.ketaatan : 0 ),
                                    ketaatan_desc: req.body.ketaatan_desc,
                                    kerjasama: ( req.body.kerjasama !== '' && req.body.kerjasama !== null ? req.body.kerjasama : 0 ),
                                    kerjasama_desc: req.body.kerjasama_desc,
                                    kepemimpinan: ( req.body.kepemimpinan !== '' && req.body.kepemimpinan !== null ? req.body.kepemimpinan : 0 ),
                                    kepemimpinan_desc: req.body.kepemimpinan_desc,
                                    jumlah: ( req.body.jumlah !== '' && req.body.jumlah !== null ? req.body.jumlah : 0 ),
                                    nilai_rata_rata: ( req.body.nilai_rata_rata !== '' && req.body.nilai_rata_rata !== null ? req.body.nilai_rata_rata : 0 ),
                                    nilai_desc: req.body.nilai_desc,
                                    createdAt: currTime
                                })
                                .then( dp3 => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data DP3 berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    }else if( req.body.act == 'edit' ){
                        libUtil.getDecrypted( req.body.dp3_id, function( decryptedId ){
                            libUtil.getDecrypted( req.body.pejabat_penilai_id, function( decryptedPejabatPenilaiId ){         
                                libUtil.getCurrDateTime(function(currTime){
                                    return modelDP3
                                        .update({
                                            pangkat_id: req.body.pangkat_id,
                                            tahun: req.body.tahun,
                                            kesetiaan: ( req.body.kesetiaan !== '' && req.body.kesetiaan !== null ? req.body.kesetiaan : 0 ),
                                            kesetiaan_desc: req.body.kesetiaan_desc,
                                            tanggung_jawab: ( req.body.tanggung_jawab !== '' && req.body.tanggung_jawab !== null ? req.body.tanggung_jawab : 0 ),
                                            tanggung_jawab_desc: req.body.tanggung_jawab_desc,
                                            kejujuran: ( req.body.kejujuran !== '' && req.body.kejujuran !== null ? req.body.kejujuran : 0 ),
                                            kejujuran_desc: req.body.kejujuran_desc,
                                            prakarsa: ( req.body.prakarsa !== '' && req.body.prakarsa !== null ? req.body.prakarsa : 0 ),
                                            prakarsa_desc: req.body.prakarsa_desc,
                                            prestasi_kerja: ( req.body.prestasi_kerja !== '' && req.body.prestasi_kerja !== null ? req.body.prestasi_kerja : 0 ),
                                            prestasi_kerja_desc: req.body.prestasi_kerja_desc,
                                            ketaatan: ( req.body.ketaatan !== '' && req.body.ketaatan !== null ? req.body.ketaatan : 0 ),
                                            ketaatan_desc: req.body.ketaatan_desc,
                                            kerjasama: ( req.body.kerjasama !== '' && req.body.kerjasama !== null ? req.body.kerjasama : 0 ),
                                            kerjasama_desc: req.body.kerjasama_desc,
                                            kepemimpinan: ( req.body.kepemimpinan !== '' && req.body.kepemimpinan !== null ? req.body.kepemimpinan : 0 ),
                                            kepemimpinan_desc: req.body.kepemimpinan_desc,
                                            jumlah: ( req.body.jumlah !== '' && req.body.jumlah !== null ? req.body.jumlah : 0 ),
                                            nilai_rata_rata: ( req.body.nilai_rata_rata !== '' && req.body.nilai_rata_rata !== null ? req.body.nilai_rata_rata : 0 ),
                                            nilai_desc: req.body.nilai_desc,
                                            pejabat_penilai_id: ( decryptedPejabatPenilaiId !== '' ? decryptedPejabatPenilaiId : 0 ),
                                            updatedAt: currTime
                                        },{
                                            where:{
                                                id: decryptedId
                                            }
                                        })
                                        .then( () => {
                                            joResult = JSON.stringify({
                                                "status_code": "00",
                                                "status_msg": "Data DP3 berhasil disimpan."
                                            });
                    
                                            res.setHeader('Content-Type','application/json');
                                            res.status(201).send(joResult);
                                        } );
            
                                });
                            });
                        } );
                    }
                    
                } );
                
            }
        });
    },

    delete( req, res ){

		jwtAuth.checkJWTAuth(( req.headers['authorization'] || req.headers['x-access-token'] ), function(data){

			var joAuth = JSON.parse( data );
			var joResult;

			if( joAuth.err_code == '-99' ){
				res.setHeader('Content-Type','application/json');
				res.status(400).send(joAuth);
			}else{

				libUtil.getDecrypted( req.body.id, function( decryptedId ){

                    return modelDP3.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){

                            modelDP3.destroy({
                                where: {
                                    id: decryptedId
                                }
                            })
                            .then( dataDelete => {

                                joResult = JSON.stringify({
                                    'status_code': '00',
                                    'status_msg': 'Data successfully deleted'
                                });
                                res.setHeader('Content-Type','application/json');
                                res.status(404).send(joResult);

                            } )
                            
                        }else{
                            joResult = JSON.stringify({
                                'status_code': '-99',
                                'status_msg': 'Data not found.'
                            });
                            res.setHeader('Content-Type','application/json');
                            res.status(201).send(joResult);
                        }
                    } );

                });
			}

		});

	}
}