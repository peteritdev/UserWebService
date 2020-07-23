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
const modelPangkat = require('../models').db_pangkat;
const modelUnor = require('../models').db_unor;
const modelUnorInduk = require('../models').db_unor_induk;
const modelInstansiKerja = require('../models').db_instansi_kerja;
const modelSatuanKerja = require('../models').db_satuan_kerja;
const modelEselon = require('../models').db_eselon;
const modelJabatanFungsional = require('../models').db_jabatan_fungsional;
const modelJabatanFungsionalUmum = require('../models').db_jabatan_fungsional_umum;

const modelKtua = require('../models').db_ktua;
const modelTaspen = require('../models').db_taspen;
const modelJabatanStruktural = require('../models').db_jabatan_struktural;
const modelInstansiInduk = require('../models').db_instansi_induk;
const modelSatuanKerjaInduk = require('../models').db_satuan_kerja_induk;
const modelKanreg = require('../models').db_kanreg;
const modelGolonganAkhir = require('../models').db_golongan_akhir;
const modelTipeKursus = require('../models').db_tipe_kursus;
const modelJenisKursus = require('../models').db_jenis_kursus;
const modelJenisPenghargaan = require('../models').db_jenis_penghargaan;
const modelJenisHukuman = require('../models').db_jenis_hukuman;
const modelJenisPemberhentian = require('../models').db_jenis_pemberhentian;

let currDateTime = "";

const libUtil = require('../libraries/utility.js');

function Syncmasterdata(){

    libUtil.getCurrDateTime(function(curr){
        currDateTime = curr;
    });

    this.saveAgama = function( id, name ){

        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelAgama
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Agama successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelAgama
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Agama successfully updated"
                                    });
                                    resolve(id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveAgama] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveAgama] : " + error);
                    } );

            }else{
                resolve(0);
            }

        });
    },

    this.saveStatusPernikahan = function( id, name, callback ){

        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelStatusNikah
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Status Pernikahan successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelStatusNikah
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Status Pernikahan successfully updated"
                                    });
                                    resolve(id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveStatusPernikahan] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveStatusPernikahan] : " + error);
                    } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveJenisKelamin = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelJenisKelamin
                .findOrCreate({
                    where:{
                        id: id
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
                            "status_msg": "Jenis Kelamin successfully created"
                        });
                        resolve(data.id);
                    }else{
                        modelJenisKelamin
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    id: id
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jenis Kelamin successfully updated"
                                });
                                resolve(id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJenisKelamin] : " + error);
                            } );
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Update [SyncMasterData.SaveJenisKelamin] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveTipePegawai = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelTipePegawai
                .findOrCreate({
                    where:{
                        id: id
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
                            "status_msg": "Tipe Pegawai successfully created"
                        });
                        resolve(data.id);
                    }else{
                        modelTipePegawai
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    id: id
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Tipe Pegawai successfully updated"
                                });
                                resolve(id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJenisPegawai] : " + error);
                            } );
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveJenisPegawai] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveJabatan = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelJabatan
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
                            "status_msg": "Jabatan successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelJabatan
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jabatan successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJabatan] : " + error);
                            } );
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveJabatan] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveStatusPegawai = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id !== null && name != "" ){
                modelStatusPegawai
                .findOrCreate({
                    where:{
                        name: name
                    },
                    defaults: {
                        createdAt: currDateTime
                    }
                })
                .spread((data, created) => {

                    if( created ){
                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Status Pegawai successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Status Pegawai already exists",
                            "id": data.id
                        });
                        resolve(data.id);
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveStatusPegawai] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveKppn = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelKppn
                .findOrCreate({
                    where:{
                        id: id
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
                            "status_msg": "KPPN successfully created"
                        });
                        resolve(data.id);
                    }else{
                        modelJenisPegawai
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    id: id
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "KPPN successfully updated"
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveKPPN] : " + error);
                            } );
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveKPPN] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveJenisPegawai = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelJenisPegawai
                .findOrCreate({
                    where:{
                        id: id
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
                            "status_msg": "Jenis Pegawai successfully created"
                        });
                        resolve(data.id);
                    }else{
                        modelJenisPegawai
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    id: id
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jenis Pegawai successfully updated"
                                });
                                resolve(id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJenisPegawai] : " + error);
                            } );
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Update [SyncMasterData.SaveJenisPegawai] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveKedudukan = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelKedudukan
                .findOrCreate({
                    where:{
                        id: id
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
                            "status_msg": "Kedudukan successfully created"
                        });
                        resolve(data.id);
                    }else{
                        modelKedudukan
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    id: id
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Kedudukan successfully updated"
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveKedudukan] : " + error);
                            } );
                    }

                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveKedudukan] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveTingkatPendidikan = function( id, name ){
        
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelTingkatPendidikan
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Tingkat Pendidikan successfully created"
                            });
                            resolve( data.id );
                        }else{
                            modelTingkatPendidikan
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Tingkat Pendidikan successfully updated"
                                    });
                                    resolve( id );
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveTingkatPendidikan] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveTingkatPendidikan] : " + error);
                    } );
            }else{
                resolve(0);
            }

        } );
    },    

    this.savePendidikanJurusan = function( code, name ){

        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){        
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
                            resolve(data.id);
                        }else{
                            modelJurusan
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        code: code
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Jurusan successfully updated",
                                        "id": data.id
                                    });
                                    resolve(data.id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveJurusan] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveJurusan] : " + error);
                    } );
            }else{
                resolve(0);
            }

        });
    },

    this.saveNamaDiklat = function( id, name ){

        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelNamaDiklat
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Nama Diklat successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelNamaDiklat
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Nama Diklat successfully updated"
                                    });
                                    resolve(data.id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveNamaDiklat] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveNamaDiklat] : " + error);
                    } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveGolongan = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelGolongan
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Golongan successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelGolongan
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Golongan successfully updated"
                                    });
                                    resolve(data.id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveGolongan] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveGolongan] : " + error);
                    } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveGolonganRuangAkhir = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelGolonganAkhir
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Golongan Akhir successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelGolonganAkhir
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Golongan Akhir successfully updated"
                                    });
                                    resolve(data.id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveGolonganAkhir] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveGolonganAkhir] : " + error);
                    } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveKenaikanPangkat = function( id, name ){
        return new Promise( function(resolve,reject){           

            if( id != "" && id != null ){
                modelKenaikanPangkat
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Kenaikan Pangkat successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelKenaikanPangkat
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Kenaikan Pangkat successfully updated"
                                    });
                                    resolve(id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveKenaikanPangkat] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveKenaikanPangkat] : " + error);
                    } );
            }else{
                resolve(0);
            }
        });
    },

    /*module.exports.saveTingkatPendidikan = function( id, name ){
        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelTingkatPendidikan
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Tingkat Pendidikan successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelTingkatPendidikan
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Tingkat Pendidikan successfully updated"
                                    });
                                    resolve(data.id);
                                } )
                                .catch( error => {} );
                        }
    
                })
                .catch( error => {} );
            }
        });
    },*/
    
    this.savePangkat = function( id, name ){
        return new Promise( function(resolve,reject){ 
            if( id !== "" && id !== null && name !== null ){
                console.log(">>> NAMA : " + name);
                modelPangkat
                .findOrCreate({
                    where:{
                        name: name
                    },
                    defaults: {
                        createdAt: currDateTime
                    }
                })
                .spread((data, created) => {
    
                    if( created ){
                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Pangkat successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        joResult = JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Pangkat already exists",
                            "id": data.id
                        });
                        resolve(data.id);
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SavePangkat] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveUnor = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelUnor
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
                            "status_msg": "Unit Organisasi successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelUnor
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Unit Organisasi successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveUnor] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveUnor] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveUnorInduk = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelUnorInduk
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
                            "status_msg": "Unit Organisasi Induk successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelUnorInduk
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Unit Organisasi Induk successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveUnorInduk] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveUnorInduk] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveInstansiKerja = function( code, name ){

        return new Promise( function(resolve,reject){
            if( code !== "" && code !== null ){
                modelInstansiKerja
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
                            "status_msg": "Instansi Kerja Induk successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelInstansiKerja
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Instansi Kerja Induk successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveInstansiKerja] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveInstansiKerja] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveSatuanKerja = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelSatuanKerja
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
                            "status_msg": "Satuan Kerja successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelSatuanKerja
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Satuan Kerja successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveSatuanKerja] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveSatuanKerja] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveEselon = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelEselon
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
                            "status_msg": "Eselon successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelEselon
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Eselon successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveEselon] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveEselon] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveJabatanFungsional = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelJabatanFungsional
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
                            "status_msg": "Jabatan Fungsional successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelJabatanFungsional
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jabatan Fungsional successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJabatanFungsional] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveJabatanFungsional] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveJabatanFungsionalUmum = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelJabatanFungsionalUmum
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
                            "status_msg": "Jabatan Fungsional Umum successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelJabatanFungsionalUmum
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jabatan Fungsional Umum successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJabatanFungsionalUmum] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveJabatanFungsionalUmum] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveKtua = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelKtua
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
                            "status_msg": "KTUA successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelUnor
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "KTUA successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveKtua] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveKtua] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },
    
    this.saveTaspen = function( id, name ){
        return new Promise( function(resolve,reject){           

            if( id != "" && id != null ){
                modelTaspen
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Taspen successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelTaspen
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Taspen successfully updated"
                                    });
                                    resolve(id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.SaveTaspen] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.SaveTaspen] : " + error);
                    } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveJabatanStruktural = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelJabatanStruktural
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
                            "status_msg": "Jabatan Struktural successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelJabatanStruktural
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jabatan Struktural successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJabatanStruktural] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveJabatanStruktural] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveInstansiInduk = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelInstansiInduk
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
                            "status_msg": "Instansi Induk successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelInstansiInduk
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Instansi Induk successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveInstansiInduk] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveInstansiInduk] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveSatuanKerjaInduk = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelSatuanKerjaInduk
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
                            "status_msg": "Satuan Kerja Induk successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelSatuanKerjaInduk
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Satuan Kerja Induk successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveSatuanKerjaInduk] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveSatuanKerjaInduk] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveKanreg = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelKanreg
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
                            "status_msg": "Kanreg successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelKanreg
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Kanreg successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveKanreg] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveKanreg] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveUnor = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelUnor
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
                            "status_msg": "Unit Organisasi successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelUnor
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Unit Organisasi successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveUnor] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveUnor] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveTipeKursus = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelTipeKursus
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
                            "status_msg": "Tipe Kursus successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelTipeKursus
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Tipe Kursus successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveTipeKursus] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveTipeKursus] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveJenisKursus = function( code, name ){
        return new Promise( function(resolve,reject){
            if( code != "" && code != null ){
                modelJenisKursus
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
                            "status_msg": "Jenis Kursus successfully created",
                            "id": data.id
                        });
                        resolve(data.id);
                    }else{
                        modelJenisKursus
                            .update({
                                name: name,
                                updatedAt: currDateTime
                            },{
                                where:{
                                    code: code
                                }
                            })
                            .then( () => {
                                joResult = JSON.stringify({
                                    "status_code": "00",
                                    "status_msg": "Jenis Kursus successfully updated",
                                    "id": data.id
                                });
                                resolve(data.id);
                            } )
                            .catch( error => {
                                libUtil.writeLog("Error Update [SyncMasterData.SaveJenisKursus] : " + error);
                            } );
                    }
    
                })
                .catch( error => {
                    libUtil.writeLog("Error Create [SyncMasterData.SaveJenisKursus] : " + error);
                } );
            }else{
                resolve(0);
            }
        });
    },

    this.saveJenisPenghargaan = function( id, name ){

        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelJenisPenghargaan
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Jenis Penghargaan successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelJenisPenghargaan
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Jenis Penghargaan successfully updated"
                                    });
                                    resolve(id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.JenisPenghargaan] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.JenisPenghargaan] : " + error);
                    } );

            }else{
                resolve(0);
            }

        });
    },

    this.saveJenisHukuman = function( id, name ){

        return new Promise( function(resolve,reject){
            if( id != "" && id != null ){
                modelJenisHukuman
                    .findOrCreate({
                        where:{
                            id: id
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
                                "status_msg": "Jenis Hukuman successfully created"
                            });
                            resolve(data.id);
                        }else{
                            modelJenisHukuman
                                .update({
                                    name: name,
                                    updatedAt: currDateTime
                                },{
                                    where:{
                                        id: id
                                    }
                                })
                                .then( () => {
                                    joResult = JSON.stringify({
                                        "status_code": "00",
                                        "status_msg": "Jenis Hukuman successfully updated"
                                    });
                                    resolve(id);
                                } )
                                .catch( error => {
                                    libUtil.writeLog("Error Update [SyncMasterData.JenisHukuman] : " + error);
                                } );
                        }

                    })
                    .catch( error => {
                        libUtil.writeLog("Error Create [SyncMasterData.JenisHukuman] : " + error);
                    } );

            }else{
                resolve(0);
            }

        });
    }

};



module.exports = new Syncmasterdata();