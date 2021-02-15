const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');

const env         = process.env.NODE_ENV || 'development';
const config      = require(__dirname + '/../config/config.json')[env];

// Utility
const Util = require('peters-globallib');
const _utilInstance = new Util();

// Repository
const UserLevelRepository = require( '../repository/userlevelrepository.js' );
const _userLevelRepository = new UserLevelRepository();

class UserLevelService{
    constructor(){}

    async getById(pParam){
        var xJoResult = {};
        var xFlagProcess = false;
        
        var xDecId = await _utilInstance.decrypt( pParam.id, config.cryptoKey.hashKey );
        if( xDecId.status_code == '00' ){
            pParam.id = xDecId.decrypted;
        }else{
            xJoResult = xDecId;
            xFlagProcess = false;
        }

        if( xFlagProcess )xJoResult = await _userLevelRepository.getById(pParam);

        return xJoResult;
    }

    async list(pParam){
        var xJoResult = {};
        var xJoArrData = [];       

        var xResultList = await _userLevelRepository.list(pParam);

        console.log(JSON.stringify(xResultList));

        if( xResultList.count > 0 ){
            xJoResult.status_code = "00";
            xJoResult.status_msg = "OK";
            xJoResult.total_record = xResultList.count;

            var xRows = xResultList.rows;

            for(var index in xRows){                

                xJoArrData.push({
                    id: await _utilInstance.encrypt((xRows[index].id).toString(), config.cryptoKey.hashKey),
                    name: xRows[index].name,
                    app: xRows[index].app,
                    created_at: moment(xRows[index].createdAt).format('YYYY-MM-DD HH:mm:ss'),
                    updated_at: moment(xRows[index].updatedAt).format('YYYY-MM-DD HH:mm:ss'),
                });
            }

            xJoResult.data = xJoArrData;
        }else{
            xJoResult.status_code = "-99";
            xJoResult.status_msg = "Data not found";
            xJoResult.total_record = 0;
            xJoResult.data = xJoArrData;
        }

        return (xJoResult);
    }

    async dropDownList(pParam){
        var xJoResult = {};
        var xJoArrData = [];       

        var xResultList = await _userLevelRepository.list(pParam);

        if( xResultList.count > 0 ){
            xJoResult.status_code = "00";
            xJoResult.status_msg = "OK";

            var xRows = xResultList.rows;

            for(var index in xRows){                

                xJoArrData.push({
                    id: xRows[index].id,
                    name: xRows[index].name,
                });
            }

            xJoResult.data = xJoArrData;
        }else{
            xJoResult.status_code = "-99";
            xJoResult.status_msg = "Data not found";
            xJoResult.data = xJoArrData;
        }

        return (xJoResult);
    }

    async save( pParam ){
        var xJoResult = {};
        var xAct = pParam.act;
        delete pParam.xAct;
        var xFlagProcess = true;

        var xDecId = await _utilInstance.decrypt( pParam.user_id, config.cryptoKey.hashKey );                 
        if( xDecId.status_code == '00' ){
            if( xAct == "add" ){
                pParam.created_by = xDecId.decrypted;
                pParam.created_by_name = pParam.user_name;
            }else if( xAct == "update" ){
                xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
                if( xDecId.status_code == '00' ){
                    pParam.id = xDecId.decrypted;
                }else{
                    xFlagProcess = false;
                    xJoResult = xDecId;
                }
                pParam.updated_by = xDecId.decrypted;
                pParam.updated_by_name = pParam.user_name;
            }            
        }else{
            xFlagProcess = false;
            xJoResult = xDecId;
        }

        if( xFlagProcess )xJoResult = await _userLevelRepository.save(pParam, xAct);

        return xJoResult;
    }

    async delete( pParam ){
        var xJoResult;
        var xFlagProcess = true;       

        var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
        if( xDecId.status_code == "00" ){
            pParam.id = xDecId.decrypted;                    
            // xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
            // if( xDecId.status_code == "00" ){
            //     pParam.deleted_by = xDecId.decrypted;
            //     pParam.deleted_by_name = pParma.user_name;
            // }else{
            //     xFlagProcess = false;
            //     xJoResult = xDecId;
            // }
        }else{
            xFlagProcess = false;
            xJoResult = xDecId;
        }

        if( xFlagProcess ){
            var xJoResult = await _userLevelRepository.delete( pParam );       
        }

        return xJoResult;

    }
}

module.exports = UserLevelService;