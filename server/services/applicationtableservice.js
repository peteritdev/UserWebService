const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');
const fs = require('fs');


const env         = process.env.NODE_ENV || 'localhost';
const config      = require(__dirname + '/../config/config.json')[env];

//Repository
const ApplicationTableRepository = require('../repository/applicationtablerepository.js');
const _repoInstance = new ApplicationTableRepository();

//Util
const Utility = require('peters-globallib');
const _utilInstance = new Utility();

class ApplicationTableService {
    constructor(){}

    async list(pParam){
        var xJoResult = {};
        var xJoArrData = [];       

        var xResultList = await _repoInstance.list(pParam);

        if( xResultList.count > 0 ){
            xJoResult.status_code = "00";
            xJoResult.status_msg = "OK";
            xJoResult.total_record = xResultList.count;

            var xRows = xResultList.rows;

            for(var index in xRows){                

                xJoArrData.push({
                    id: await _utilInstance.encrypt((xRows[index].id).toString(), config.cryptoKey.hashKey),
                    application: xRows[index].application,
                    table_name: xRows[index].table_name,
                    created_at: moment(xRows[index].createdAt).format('DD-MM-YYYY HH:mm:ss'),
                    updated_at: moment(xRows[index].updatedAt).format('DD-MM-YYYY HH:mm:ss'),
                });
            }

            xJoResult.data = xJoArrData;
        }else{
            xJoResult.status_code = "-99";
            xJoResult.status_msg = "Data not found";
        }

        return (xJoResult);
    }
    
    async dropDownList(pParam){
        var xJoResult = {};
        var xJoArrData = [];  
        var xFlagProcess = true;     

        if( xFlagProcess ){

            if( pParam.hasOwnProperty('application_id') ){
                if( pParam.application_id != '' ){
                    var xDecId = await _utilInstance.decrypt( pParam.application_id, config.cryptoKey.hashKey );
                    if( xDecId.status_code == '00' ){
                        pParam.application_id = xDecId.decrypted;
                    }else{
                        xFlagProcess = false;
                        xJoResult = xDecId;
                    }
                }
            }

            var xResultList = await _repoInstance.list(pParam);

            if( xResultList.count > 0 ){
                xJoResult.status_code = "00";
                xJoResult.status_msg = "OK";

                var xRows = xResultList.rows;

                for(var index in xRows){                

                    xJoArrData.push({
                        id: xRows[index].id,
                        name: xRows[index].table_name,
                    });
                }

                xJoResult.data = xJoArrData;
            }else{
                xJoResult.status_code = "00";
                xJoResult.status_msg = "OK";
                xJoResult.data = xJoArrData;
            }

        }        

        return (xJoResult);
    }

    async getById( pParam ){
        var xJoResult;
        var xFlag = true;

        var xDecId = await _utilInstance.decrypt( pParam.id, config.cryptoKey.hashKey );
        if( xDecId.status_code == '00' ){
            pParam.id = xDecId.decrypted;
        }else{
            xFlag = false;
            xJoResult = xDecId;
        }

        if( xFlag ){
            var xData = await _repoInstance.getById(pParam);
            if( xData != null ){
                xJoResult = {
                    status_code: "00",
                    status_msg: "OK",
                    data: {
                        id: await _utilInstance.encrypt( xData.id, config.cryptoKey.hashKey ),
                        application: xData.application,
                        table_name: xData.table_name,
                        status: xData.status,
                        created_at: moment(xData.createdAt).format('DD-MM-YYYY HH:mm:ss'),
                        updated_at: moment(xData.updatedAt).format('DD-MM-YYYY HH:mm:ss'),
                    }
                }
            }
        }

        return xJoResult;
    }

    async save(pParam){
        var xJoResult;
        var xAct = pParam.act;
        var xFlagProcess = true;

        delete pParam.act;

        if( xAct == "add" ){           

            // User Id
            var xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
            if( xDecId.status_code == '00' ){
                pParam.created_by = xDecId.decrypted;
                pParam.created_by_name = pParam.user_name;
            }else{
                xFlagProcess = false;
                xJoResult = xDecId;
            }
            
            if( xFlagProcess ){
                var xAddResult = await _repoInstance.save( pParam, xAct );
                xJoResult = xAddResult;
            }           


        }else if( xAct == "update" ){

            var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
            if( xDecId.status_code == "00" ){
                pParam.id = xDecId.decrypted;                    
                xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
                if( xDecId.status_code == "00" ){
                    pParam.updated_by = xDecId.decrypted;
                    pParam.updated_by_name = pParam.user_name;
                }else{
                    xFlagProcess = false;
                    xJoResult = xDecId;
                }                
            }else{
                xFlagProcess = false;
                xJoResult = xDecId;
            }

            if( xFlagProcess ){
                var xAddResult = await _repoInstance.save( pParam, xAct );
                xJoResult = xAddResult;
            }
            
        }

        return xJoResult;
    }

    async delete( pParam ){
        var xJoResult;
        var xFlagProcess = true;  

        var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
        if( xDecId.status_code == "00" ){
            pParam.id = xDecId.decrypted;                    
            xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
            if( xDecId.status_code == "00" ){
                pParam.deleted_by = xDecId.decrypted;
                pParam.deleted_by_name = pParam.user_name;
            }else{
                xFlagProcess = false;
                xJoResult = xDecId;
            }
        }else{
            xFlagProcess = false;
            xJoResult = xDecId;
        }

        var xDeleteResult = await _repoInstance.delete( pParam );
        xJoResult = xDeleteResult;

        return xJoResult;
    }

}

module.exports = ApplicationTableService;