const moment    = require('moment');
var env         = process.env.NODE_ENV || 'development';
var config      = require(__dirname + '/../config/config.json')[env];
var Sequelize   = require('sequelize');
const Op        = Sequelize.Op;
var sequelize   = new Sequelize(config.database, config.username, config.password, config);
const promise   = require('promise');

const modelRiwayatJabatan = require('../models').user_history_jabatan;
const modelUser = require('../models').users;
const modelUnor = require('../models').db_unor;

const libUtil = require('../libraries/utility.js');

function RiwayatJabatanService(){ 

    this.getAnggotaUnor = function( pData ){

        return new Promise( function( resolve, reject ){
            var userName = "";
            var sql = " SELECT u.id, u.name AS unor_name, u.parent_id, us.name AS user_name " + 
                        " FROM db_unor u INNER JOIN user_history_jabatan uhj ON u.id = uhj.unor_id " + 
                        " INNER JOIN users us ON uhj.user_id = us.id " +
                        " WHERE uhj.unor_id = " + pData.id + 
                        " AND uhj.jabatan_fungsional_umum_id = 0 " + 
                        " ORDER BY uhj.tmt_jabatan DESC " +
                        " LIMIT 1 ";

            return sequelize.query(
                sql, 
                {
                    type: sequelize.QueryTypes.SELECT
                }
            )
            .then( data => {
                //console.log(">>> TEST 1 : "+  JSON.stringify(data[0]));
                resolve(data[0]);                 
                
            } )
            .catch( error => {
                libUtil.writeLog("Error Create [RiwayatJabatanService.getAnggotaUnor] : " + error);
            } );
        } );        

    },

    this.getUnorParent = function( pId ){
        return new Promise( function( resolve, reject ){
            return modelUnor.findOne( {
                where:{
                    id: pId
                }
            } )
            .then( data => {
                if( data != null ){
                    resolve( data.parent_id )
                }else{
                    resolve( 0 );
                }
            } )
        } );
    }

    /*this.getAnggotaUnor2 = function( pData ){

        var userName = "";
        var sql = " SELECT u.id, u.name AS unor_name, u.parent_id, us.name AS user_name " + 
                    " FROM db_unor u INNER JOIN user_history_jabatan uhj ON u.id = uhj.unor_id " + 
                    " INNER JOIN users us ON uhj.user_id = us.id " +
                    " WHERE uhj.unor_id = " + pData.id + 
                    " AND uhj.jabatan_fungsional_umum_id = 0 " + 
                    " ORDER BY uhj.tmt_jabatan DESC " +
                    " LIMIT 1 ";

        return sequelize.query(
            sql, 
            {
                type: sequelize.QueryTypes.SELECT
            }
        )
        .then( data => {
            //console.log(">>> TEST 1 : " + JSON.stringify(data[0]));
            return data[0];           
            
        } )
        .catch( error => {
            libUtil.writeLog("Error Create [RiwayatJabatanService.getAnggotaUnor] : " + error);
        } );       

    }*/

}

module.exports = new RiwayatJabatanService();