const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
var config = require('../config/config.json');
const promise = require('promise');

const modelUser = require('../models').users;
const modelPMK = require('../models').user_history_peninjauan_masa_kerja;

const libUtil = require('../libraries/utility.js');

function UserService(){ 
    
    this.getMasaKerja = function( pId ){

        return new Promise( function( resolve, reject ){

            var currDate;
            libUtil.getCurrDate( function( pCurrDate ){
                currDate = pCurrDate;
            } );

            modelPMK.findOne( {
                where: {
                    user_id: pId
                },
                order:[['tgl_akhir', 'DESC']],
                limit: 1
            } )
            .then( pmk => {
                var jsonResult = JSON.stringify({
                    "curr_date": currDate,
                    "masa_kerja_tahun": ( pmk != null ? pmk.masa_kerja_tahun : 0),
                    "masa_kerja_bulan": ( pmk != null ? pmk.masa_kerja_bulan : 0)
                });
                resolve(jsonResult);
            } )
            .catch( error => {

            } );

        } );

    },

    this.updateFileName = function( pFileName, pId, pType ){

        return new Promise( function( resolve, reject ){

            var columnUpdate;

            if( pType == 1 ){
                columnUpdate = {
                    file_kartu_pegawai: pFileName
                }
            }else if( pType == 2 ){
                columnUpdate = {
                    file_ktp: pFileName
                }
            }
            else if( pType == 3 ){
                columnUpdate = {
                    file_kartu_keluarga: pFileName
                }
            }
            else if( pType == 4 ){
                columnUpdate = {
                    file_buku_tabungan: pFileName
                }
            }
            else if( pType == 5 ){
                columnUpdate = {
                    file_npwp: pFileName
                }
            }
            else if( pType == 6 ){
                columnUpdate = {
                    file_lhkpn: pFileName
                }
            }
            else if( pType == 7 ){
                columnUpdate = {
                    file_askes_atau_bpjs: pFileName
                }
            }
            else if( pType == 8 ){
                columnUpdate = {
                    file_taspen: pFileName
                }
            }

            return modelUser 
                .update( columnUpdate, {
                    where: {
                        id: pId
                    }
                } )
                .then( () => {
                    resolve(1);
                } )
                .catch( error => {
                    libUtil.writeLog("Error [UserService.updateFileName] : " + error);
                } );
        } );

    }

}

module.exports = new UserService();