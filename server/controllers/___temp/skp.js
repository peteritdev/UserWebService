const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const dateFormat = require('dateformat');

var config = require('../config/config.json');

const modelSKP = require('../models').user_history_skp;

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
                
                    return  modelSKP.findAndCountAll({
                                where:{
                                    /*[Op.or]:[
                                        {
                                            tahun: req.query.keyword
                                        },{
                                            penilai_nip: req.query.keyword
                                        },{
                                            penilai_nama: req.query.keyword
                                        }
                                    ],*/
                                    [Op.or]:[
                                        {user_id:decryptedId}
                                    ]
                                }
                            })
                            .then( data => {
                                modelSKP.findAll({
                                    where:{
                                        /*[Op.or]:[
                                            {
                                                tahun: req.query.keyword
                                            },{
                                                penilai_nip: req.query.keyword
                                            },{
                                                penilai_nama: req.query.keyword
                                            }
                                        ],*/
                                        [Op.and]:[
                                            {user_id:decryptedId}
                                        ]
                                    },
                                    limit: limit,
                                    offset: offset,
                                })
                                .then( skp => {
                                    for( var i = 0; i < skp.length; i++ ){
                                        libUtil.getEncrypted( (skp[i].id).toString(), function(ecnryptedData){
                                            var data = skp[i].pangkat_id + config.frontParam.separatorData + //0
                                                       skp[i].tahun + config.frontParam.separatorData +  //1
                                                       skp[i].nilai_skp + config.frontParam.separatorData + //2
                                                       skp[i].orientasi_pelayanan + config.frontParam.separatorData + //3
                                                       skp[i].integritas + config.frontParam.separatorData + //4
                                                       skp[i].komitmen + config.frontParam.separatorData + //5
                                                       skp[i].disiplin + config.frontParam.separatorData + //6
                                                       skp[i].kerjasama + config.frontParam.separatorData + //7
                                                       skp[i].nilai_perilaku_kerja + config.frontParam.separatorData + //8
                                                       skp[i].nilai_prestasi_kerja + config.frontParam.separatorData + //9
                                                       skp[i].kepemimpinan + config.frontParam.separatorData + //10
                                                       skp[i].jumlah + config.frontParam.separatorData + //11
                                                       skp[i].nilai_rata_rata + config.frontParam.separatorData + //12

                                                       skp[i].penilai_nip + config.frontParam.separatorData + //13
                                                       skp[i].penilai_nama + config.frontParam.separatorData + //14
                                                       skp[i].penilai_unor_nama + config.frontParam.separatorData + //15 
                                                       skp[i].penilai_jabatan + config.frontParam.separatorData + //16
                                                       skp[i].penilai_golongan + config.frontParam.separatorData + //17
                                                       skp[i].penilai_tmt_golongan + config.frontParam.separatorData + //18
                                                       skp[i].status_penilai + config.frontParam.separatorData + //19

                                                       skp[i].atasan_penilai_unor_nama + config.frontParam.separatorData + //20
                                                       skp[i].atasan_penilai_jabatan + config.frontParam.separatorData + //21
                                                       skp[i].atasan_penilai_golongan + config.frontParam.separatorData + //22
                                                       skp[i].atasan_penilai_tmt_golongan + config.frontParam.separatorData + //23
                                                       skp[i].atasan_status_penilai + config.frontParam.separatorData + //24
                                                       skp[i].atasan_penilai_nama;//25
                                            var navigation = '<a href="#" data-toggle="modal" data-target="#modal-skp-detail" class="btn btn-warning" name="link-detail-skp" data="' + data + '"><i class="glyphicon glyphicon-fullscreen"></i></a>';

                                            joData.push({
                                                tahun: skp[i].tahun,
                                                rata_rata: skp[i].nilai_rata_rata,
                                                keterangan: "",
                                                jumlah: ( parseInt(skp[i].orientasi_pelayanan) + parseInt( skp[i].komitmen ) + parseInt( skp[i].kerjasama ) + parseInt( skp[i].integritas ) + parseInt( skp[i].disiplin ) + parseInt( skp[i].kepemimpinan ) ),
                                                pejabat_penilai: ( skp[i].penilai_nama != null ? skp[i].penilai_nama : '' ),
                                                atasan_pejabat_penilai: ( skp[i].atasan_penilai_nama != null ? skp[i].atasan_penilai_nama : '' ),
                                                navigation: navigation
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

                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error SKP.list 1: " + error);
                                } );
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error SKP.list 2: " + error);
                            } );

                })                

            }
        });

    }
}