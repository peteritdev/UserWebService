const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;

var config = require('../config/config.json');


const modelPindahInstansi = require('../models').user_history_pindah_instansi;
const modelJenisPegawai = require('../models').db_pangkat;
const modelInstansiKerja = require('../models').db_instansi_kerja;
const modelSatuanKerja = require('../models').db_satuan_kerja;
const modelUnor = require('../models').db_unor;
const modelJabfus = require('../models').db_jabatan_fungsional;
const modelInsduk = require('../models').db_instansi_induk;
const modelSatuanKerjaInduk = require('../models').db_satuan_kerja_induk;
const modelProvinsi = require('../models').db_provinsi;
const modelKPPN = require('../models').db_kppn;

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

                    return modelPindahInstansi.findAndCountAll({
                        where:{
                            [Op.or]:[
                                {
                                    '$insdukBaru.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$inskerBaru.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$insdukLama.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                },
                                {
                                    '$inskerLama.name$':{
                                        [Op.like]:'%' + keyword + '%'
                                    }                                
                                }
                            ],
                            [Op.and]:[{
                                "user_id":decryptedId
                            }]
                        },
                        include:[
                            {
                                model: modelInsduk,
                                as: 'insdukBaru'
                            },
                            {
                                model: modelInstansiKerja,
                                as: 'inskerBaru'
                            },
                            {
                                model: modelInsduk,
                                as: 'insdukLama'
                            },
                            {
                                model: modelInstansiKerja,
                                as: 'inskerLama'
                            }
                        ]
                    })
                    .then( data => {
                        modelPindahInstansi.findAll({
                            where:{
                                [Op.or]:[
                                    {
                                        '$insdukBaru.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$inskerBaru.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$insdukLama.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    },
                                    {
                                        '$inskerLama.name$':{
                                            [Op.like]:'%' + keyword + '%'
                                        }                                
                                    }
                                ],
                                [Op.and]:[{
                                    "user_id":decryptedId
                                }]
                            },
                            include:[
                                {
                                    model: modelInsduk,
                                    as: 'insdukBaru'
                                },
                                {
                                    model: modelInstansiKerja,
                                    as: 'inskerBaru'
                                },
                                {
                                    model: modelInsduk,
                                    as: 'insdukLama'
                                },
                                {
                                    model: modelInstansiKerja,
                                    as: 'inskerLama'
                                }
                            ],                     
                            limit: limit,
                            offset: offset,
                        })
                        .then( pindahInstansi => {

                            for( var i = 0; i < pindahInstansi.length; i++ ){

                                libUtil.getEncrypted( (pindahInstansi[i].id).toString(), function(ecnryptedData){                                    
                                    libUtil.getEncrypted( (pindahInstansi[i].user_id).toString(), function(ecnryptedUserData){

                                        var status = '';
                                        var navigationEdit = '';
                                        var navigationDetail = '';
                                        var navigationDelete = '';
                                        var jenisPemindahan = "";

                                        if( pindahInstansi[i].jenis_pemindahan_id == 1 ){
                                            jenisPemindahan = "Pindah Instansi";
                                        }else if( pindahInstansi[i].jenis_pemindahan_id == 2 ){
                                            jenisPemindahan = "DPB";
                                        }else if( pindahInstansi[i].jenis_pemindahan_id == 3 ){
                                            jenisPemindahan = "DPK";
                                        }else{
                                            jenisPemindahan = "-";
                                        }

                                        var dataForEdit = ecnryptedData + config.frontParam.separatorData + 
                                                            ecnryptedUserData + config.frontParam.separatorData +  
                                                            pindahInstansi[i].jenis_pemindahan_id + config.frontParam.separatorData +
                                                            pindahInstansi[i].jenis_pegawai_id + config.frontParam.separatorData +                                                              
                                                            pindahInstansi[i].pangkat_id_lama + config.frontParam.separatorData + 
                                                            pindahInstansi[i].pangkat_id_baru + config.frontParam.separatorData + 
                                                            pindahInstansi[i].insker_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].insker_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].satker_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].satker_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].unor_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].unor_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].jabfus_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].jabfus_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].insduk_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].insduk_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].satker_induk_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].satker_induk_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].lokker_lama_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].lokker_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].kppn_baru_id + config.frontParam.separatorData + 
                                                            pindahInstansi[i].jabfusum_baru_id + config.frontParam.separatorData +
                                                            pindahInstansi[i].no_surat_instansi_asal + config.frontParam.separatorData + 
                                                            ( pindahInstansi[i].tgl_surat_instansi_asal !== null && pindahInstansi[i].tgl_surat_instansi_asal !== "" && pindahInstansi[i].tgl_surat_instansi_asal !== "0000-00-00" ? dateFormat(pindahInstansi[i].tgl_surat_instansi_asal, "dd-mm-yyyy") : "") + config.frontParam.separatorData +  
                                                            pindahInstansi[i].no_surat_instansi_asal_prov + config.frontParam.separatorData + 
                                                            ( pindahInstansi[i].tgl_surat_instansi_asal_prov !== null && pindahInstansi[i].tgl_surat_instansi_asal_prov !== "" && pindahInstansi[i].tgl_surat_instansi_asal_prov !== "0000-00-00" ? dateFormat(pindahInstansi[i].tgl_surat_instansi_asal_prov, "dd-mm-yyyy") : "") + config.frontParam.separatorData +  
                                                            pindahInstansi[i].no_surat_instansi_tujuan + config.frontParam.separatorData + 
                                                            ( pindahInstansi[i].tgl_surat_instansi_tujuan !== null && pindahInstansi[i].tgl_surat_instansi_tujuan !== "" && pindahInstansi[i].tgl_surat_instansi_tujuan !== "0000-00-00" ? dateFormat(pindahInstansi[i].tgl_surat_instansi_tujuan, "dd-mm-yyyy") : "") + config.frontParam.separatorData +
                                                            pindahInstansi[i].no_surat_instansi_tujuan_prov + config.frontParam.separatorData + 
                                                            ( pindahInstansi[i].tgl_surat_instansi_tujuan_prov !== null && pindahInstansi[i].tgl_surat_instansi_tujuan_prov !== "" && pindahInstansi[i].tgl_surat_instansi_tujuan_prov !== "0000-00-00" ? dateFormat(pindahInstansi[i].tgl_surat_instansi_tujuan_prov, "dd-mm-yyyy") : "") + config.frontParam.separatorData +
                                                            pindahInstansi[i].no_sk + config.frontParam.separatorData + 
                                                            ( pindahInstansi[i].tgl_sk !== null && pindahInstansi[i].tgl_sk !== "" && pindahInstansi[i].tgl_sk !== "0000-00-00" ? dateFormat(pindahInstansi[i].tgl_sk, "dd-mm-yyyy") : "") + config.frontParam.separatorData + 
                                                            ( pindahInstansi[i].tmt_pi !== null && pindahInstansi[i].tmt_pi !== "" && pindahInstansi[i].tmt_pi !== "0000-00-00" ? dateFormat(pindahInstansi[i].tmt_pi, "dd-mm-yyyy") : "");
                                        navigationEdit = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-edit-pindahinstansi" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDetail = '<a href="#" data-toggle="modal" data-target="#modal-frm-add-edit" class="btn bg-navy" name="link-detail-pindahinstansi" data="' + dataForEdit + '"><i class="glyphicon glyphicon-pencil"></i></a>';
                                        navigationDelete = '<a href="#" data-toggle="modal" data-target="#modal-confirm-pindahinstansi" class="btn bg-red" name="link-delete-pindahinstansi" data="' + ecnryptedData + '"><i class="glyphicon glyphicon-remove"></i></a>';

                                        joData.push({
                                            index: (i+1),
                                            jenis_pemindahan: jenisPemindahan,
                                            tmt_pi: ( pindahInstansi[i].tmt_pi !== null && pindahInstansi[i].tmt_pi !== "" && pindahInstansi[i].tmt_pi !== "0000-00-00" ? dateFormat(pindahInstansi[i].tmt_pi, "dd-mm-yyyy") : ""),
                                            tgl_sk: ( pindahInstansi[i].tgl_sk !== null && pindahInstansi[i].tgl_sk !== "" && pindahInstansi[i].tgl_sk !== "0000-00-00" ? dateFormat(pindahInstansi[i].tgl_sk, "dd-mm-yyyy") : ""),
                                            insduk_baru: {
                                                id: ( pindahInstansi[i].insdukBaru !== null ? pindahInstansi[i].insdukBaru.id : 0 ),
                                                name: ( pindahInstansi[i].insdukBaru !== null ? pindahInstansi[i].insdukBaru.name : "" )
                                            },
                                            insker_baru: {
                                                id: ( pindahInstansi[i].inskerBaru !== null ? pindahInstansi[i].inskerBaru.id : 0 ),
                                                name: ( pindahInstansi[i].inskerBaru !== null ? pindahInstansi[i].inskerBaru.name : "" )
                                            },
                                            insduk_lama: {
                                                id: ( pindahInstansi[i].insdukLama !== null ? pindahInstansi[i].insdukLama.id : 0 ),
                                                name: ( pindahInstansi[i].insdukLama !== null ? pindahInstansi[i].insdukLama.name : "" )
                                            },
                                            insker_lama: {
                                                id: ( pindahInstansi[i].inskerLama !== null ? pindahInstansi[i].inskerLama.id : 0 ),
                                                name: ( pindahInstansi[i].inskerLama !== null ? pindahInstansi[i].inskerLama.name : "" )
                                            },
                                            navigation: ( navigationEdit + '&nbsp;' + navigationDelete )
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

                    var xTglSrtInstansiAsal = "";
                    var xTglSrtInstansiAsalProv = "";
                    var xTglSrtInstansiTujuan = "";
                    var xTglSrtInstansiTujuanProv = "";
                    var xTglSK = "";
                    var xTmtPi = "";
                    if( req.body.tgl_surat_instansi_asal != null && req.body.tgl_surat_instansi_asal != "" ){
                        xTglSrtInstansiAsal = libUtil.parseToFormattedDate( req.body.tgl_surat_instansi_asal );
                    }
                    if( req.body.tgl_surat_instansi_asal_prov != null && req.body.tgl_surat_instansi_asal_prov != "" ){
                        xTglSrtInstansiAsalProv = libUtil.parseToFormattedDate( req.body.tgl_surat_instansi_asal_prov );
                    }
                    if( req.body.tgl_surat_instansi_tujuan != null && req.body.tgl_surat_instansi_tujuan != "" ){
                        xTglSrtInstansiTujuan = libUtil.parseToFormattedDate( req.body.tgl_surat_instansi_tujuan );
                    }
                    if( req.body.tgl_surat_instansi_tujuan_prov != null && req.body.tgl_surat_instansi_tujuan_prov != "" ){
                        xTglSrtInstansiTujuanProv = libUtil.parseToFormattedDate( req.body.tgl_surat_instansi_tujuan_prov );
                    }
                    if( req.body.tgl_sk != null && req.body.tgl_sk != "" ){
                        xTglSK = libUtil.parseToFormattedDate( req.body.tgl_sk );
                    }
                    if( req.body.tmt_pi != null && req.body.tmt_pi != "" ){
                        xTmtPi = libUtil.parseToFormattedDate( req.body.tmt_pi );
                    }

                    if( req.body.act == 'add' ){
                        libUtil.getCurrDateTime(function(currTime){
                            return modelPindahInstansi
                                .create({
                                    user_id: decryptedUserId,
                                    jenis_pemindahan_id: req.body.jenis_pemindahan_id,
                                    jenis_pegawai_id: req.body.jenis_pegawai_id,
                                    pangkat_id_lama: req.body.pangkat_id_lama,
                                    pangkat_id_baru: req.body.pangkat_id_baru,
                                    insker_lama_id: req.body.insker_lama_id,
                                    insker_baru_id: req.body.insker_baru_id,
                                    satker_lama_id: req.body.satker_lama_id,
                                    satker_baru_id: req.body.satker_baru_id,
                                    unor_lama_id: req.body.unor_lama_id,
                                    unor_baru_id: req.body.unor_baru_id,
                                    jabfus_lama_id: req.body.jabfus_lama_id,
                                    jabfus_baru_id: req.body.jabfus_baru_id,
                                    insduk_lama_id: req.body.insduk_lama_id,
                                    insduk_baru_id: req.body.insduk_baru_id,
                                    satker_induk_lama_id: req.body.satker_induk_lama_id,
                                    satker_induk_baru_id: req.body.satker_induk_baru_id,
                                    lokker_lama_id: req.body.lokker_lama_id,
                                    lokker_baru_id: req.body.lokker_baru_id,
                                    kppn_baru_id: req.body.kppn_baru_id,
                                    jabfusum_baru_id: req.body.jabfusum_baru_id,
                                    no_surat_instansi_asal: req.body.no_surat_instansi_asal,
                                    tgl_surat_instansi_asal: ( xTglSrtInstansiAsal == "" ? null : xTglSrtInstansiAsal ),
                                    no_surat_instansi_asal_prov: req.body.no_surat_instansi_asal_prov,
                                    tgl_surat_instansi_asal_prov: ( xTglSrtInstansiAsalProv == "" ? null : xTglSrtInstansiAsalProv ),
                                    no_surat_instansi_tujuan: req.body.no_surat_instansi_tujuan,
                                    tgl_surat_instansi_tujuan: ( xTglSrtInstansiTujuan == "" ? null : xTglSrtInstansiTujuan ),
                                    no_surat_instansi_tujuan_prov: req.body.no_surat_instansi_tujuan_prov,
                                    tgl_surat_instansi_tujuan_prov: ( xTglSrtInstansiTujuanProv == "" ? null : xTglSrtInstansiTujuanProv ),
                                    no_sk: req.body.no_sk,
                                    tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                    tmt_pi: ( xTmtPi == "" ? null : xTmtPi ),
                                    createdAt: currTime
                                })
                                .then( pwk => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Data Pindah Instansi berhasil disimpan."
                                    });
            
                                    res.setHeader('Content-Type','application/json');
                                    res.status(201).send(joResult);
                                } );
    
                        });
                    }else if( req.body.act == 'edit' ){
                        libUtil.getDecrypted( req.body.pindah_instansi_id, function( decryptedId ){       
                            libUtil.getCurrDateTime(function(currTime){
                                return modelPindahInstansi
                                    .update({
                                        jenis_pemindahan_id: req.body.jenis_pemindahan_id,
                                        jenis_pegawai_id: req.body.jenis_pegawai_id,
                                        pangkat_id_lama: req.body.pangkat_id_lama,
                                        pangkat_id_baru: req.body.pangkat_id_baru,
                                        insker_lama_id: req.body.insker_lama_id,
                                        insker_baru_id: req.body.insker_baru_id,
                                        satker_lama_id: req.body.satker_lama_id,
                                        satker_baru_id: req.body.satker_baru_id,
                                        unor_lama_id: req.body.unor_lama_id,
                                        unor_baru_id: req.body.unor_baru_id,
                                        jabfus_lama_id: req.body.jabfus_lama_id,
                                        jabfus_baru_id: req.body.jabfus_baru_id,
                                        insduk_lama_id: req.body.insduk_lama_id,
                                        insduk_baru_id: req.body.insduk_baru_id,
                                        satker_induk_lama_id: req.body.satker_induk_lama_id,
                                        satker_induk_baru_id: req.body.satker_induk_baru_id,
                                        lokker_lama_id: req.body.lokker_lama_id,
                                        lokker_baru_id: req.body.lokker_baru_id,
                                        kppn_baru_id: req.body.kppn_baru_id,
                                        jabfusum_baru_id: req.body.jabfusum_baru_id,
                                        no_surat_instansi_asal: req.body.no_surat_instansi_asal,
                                        tgl_surat_instansi_asal: ( xTglSrtInstansiAsal == "" ? null : xTglSrtInstansiAsal ),
                                        no_surat_instansi_asal_prov: req.body.no_surat_instansi_asal_prov,
                                        tgl_surat_instansi_asal_prov: ( xTglSrtInstansiAsalProv == "" ? null : xTglSrtInstansiAsalProv ),
                                        no_surat_instansi_tujuan: req.body.no_surat_instansi_tujuan,
                                        tgl_surat_instansi_tujuan: ( xTglSrtInstansiTujuan == "" ? null : xTglSrtInstansiTujuan ),
                                        no_surat_instansi_tujuan_prov: req.body.no_surat_instansi_tujuan_prov,
                                        tgl_surat_instansi_tujuan_prov: ( xTglSrtInstansiTujuanProv == "" ? null : xTglSrtInstansiTujuanProv ),  
                                        no_sk: req.body.no_sk,
                                        tgl_sk: ( xTglSK == "" ? null : xTglSK ),
                                        tmt_pi: ( xTmtPi == "" ? null : xTmtPi ),
                                        updatedAt: currTime
                                    },{
                                        where:{
                                            id: decryptedId
                                        }
                                    })
                                    .then( () => {
                                        joResult = JSON.stringify({
                                            "status_code": "00",
                                            "status_msg": "Data Pindah Instansi berhasil disimpan."
                                        });
                
                                        res.setHeader('Content-Type','application/json');
                                        res.status(201).send(joResult);
                                    } );
        
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

                    return modelPindahInstansi.findAll({
                        where:{
                            id: decryptedId
                        }
                    })
                    .then( data => {
                        if( data != null ){

                            modelPindahInstansi.destroy({
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