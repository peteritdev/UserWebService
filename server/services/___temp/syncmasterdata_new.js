const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const promise = require('promise');

const modelAgama = require('../models').db_agama;
const modelStatusNikah = require('../models').db_status_pernikahan;
const modelJenisKelamin = require('../models').db_jenis_kelamin;
const modelTipePegawai = require('../models').db_tipe_pegawai;
const modelJabatan = require('../models').db_jabatan;
const modelStatusPegawai = require('../models').db_status_pegawai;
const modelJenisPegawai = require('../models').db_jenis_pegawai;
const modelKedudukan = require('../models').db_kedudukan;
const modelTingkatPendidikan = require('../models').db_tingkat_pendidikan;
const modelJurusan = require('../models').db_pendidikan_jurusan;
const modelKppn = require('../models').db_kppn;
const modelNamaDiklat = require('../models').db_nama_diklat;
const modelGolongan = require('../models').db_golongan;
const modelKenaikanPangkat = require('../models').db_kenaikan_pangkat;

const libUtil = require('../libraries/utility.js');

var xIdTingkatPendidikan = "0";
var xIdJurusan = "0";

exports.saveTingkatPendidikan = function( id, name){

    return new Promise( ( resolve, reject ) => {
        modelTingkatPendidikan
            .findOne( {
                where:{
                    id: parseInt(id)
                }
            } )
            .then( item => {
                if( !item ){
                    modelTingkatPendidikan
                        .create( {
                            id: id,
                            name: name
                        } )
                        .then( () => {
                            resolve(id)
                        } )
                }else{
                    modelTingkatPendidikan
                    .update( {
                        name: name
                    },{
                        where:{
                            id: id
                        }
                    } )
                    .then( () => {
                        resolve(id)
                    } ) 
                }
            })
    } );
}

exports.savePendidikanJurusan = ( code, name ) => {

    return new Promise( ( resolve, reject ) => {
        modelJurusan
            .findOne( {
                where:{
                    code: code
                }
            } )
            .then( item => {
                if( !item ){
                    modelJurusan
                        .create( {
                            code: code,
                            name: name
                        } )
                        .then( function( result ){
                            resolve(jsonResult)
                        } )
                        /*.then( () => {
                            resolve(item.id)
                        } )*/
                }else{
                    modelJurusan
                    .update( {
                        name: name
                    },{
                        where:{
                            code: code
                        }
                    } )
                    .then( () => {
                        resolve(item.id)
                    } ) 
                }
            })
    } );
}

/*exports.saveTingkatPendidikan_old = function saveTingkatPendidikan_old(id, name){
    var joResult = "";
    var currDateTime;

    libUtil.getCurrDateTime(function( currTime ){
        currDateTime = currTime;
    });

    modelTingkatPendidikan
        .findOrCreate({
            where:{
                id: parseInt(id)
            },
            defaults: {
                name: name,
                createdAt: currDateTime
            }
        })
        .spread((data, created) => {

            joResult = JSON.stringify({
                "status_code": "00",
                "status_msg": "Tingkat Pendidikan successfully created",
                "id": data.id
            });
            libUtil.writeLog(joResult,"syncmasterdata_new.saveTingkatPendidikan");

        })
        .catch( error => {
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg": "Error : " + error
            });
            libUtil.writeLog(joResult,"syncmasterdata_new.saveTingkatPendidikan");
        } );  
};

exports.savePendidikanJurusan = function savePendidikanJurusan(code, name){
    var joResult = "";
    var currDateTime;

    libUtil.getCurrDateTime(function( currTime ){
        currDateTime = currTime;
    });

    try{

        modelJurusan
                .findOrCreate({
                    where:{
                        code: code
                    },
                    defaults: {
                        name: name,
                        createdAt: currDateTime
                    }
                })
                .spread((data, created) => {

                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Pendidikan Jurusan successfully created",
                        "id": data.id
                    });
                    libUtil.writeLog(joResult,"syncmasterdata_new.savePendidikanJurusan");

                })
                .catch( error => {
                    joResult = JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Error : " + error
                    });
                    libUtil.writeLog(joResult,"syncmasterdata_new.savePendidikanJurusan");
                } );                
    }catch( error ){
        joResult = JSON.stringify({
            "status_code": "-99",
            "status_msg": "Error : " + error
        });
        libUtil.writeLog(joResult,"syncmasterdata_new.savePendidikanJurusan");
    }
};

/*module.exports = {
    saveTingkatPendidikan: function(id, name){

        var currDateTime;
        const joResult = "";

        libUtil.getCurrDateTime(function( currTime ){
            currDateTime = currTime;
        });

        try{        
            
            joResult = modelTingkatPendidikan
                .findOrCreate({
                    where:{
                        id: parseInt(id)
                    },
                    defaults: {
                        name: name,
                        createdAt: currDateTime
                    }
                })
                .spread((data, created) => {

                    let joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Tingkat Pendidikan successfully created",
                        "id": data.id
                    });

                })
        }catch( error ){
            let joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg": "Error : " + error
            });
        }
        
        return joResult;

    }

    savePendidikanJurusan: function( code, name ){

        var currDateTime;
        var joResult = "";
        libUtil.getCurrDateTime(function( currTime ){
            currDateTime = currTime;
        });

        try{
            modelJurusan
            .findOrCreate({
                where:{
                    code: code
                },
                defaults: {
                    name: name,
                    createdAt: currDateTime
                }
            })
            .spread((data, created) => {

                if( created ){
                    joResult = JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Jurusan successfully created",
                        "id": data.id
                    });
                }else{
                    
                }

            });

        }catch( error ){
            
        }

        return joResult;

    }
}*/
