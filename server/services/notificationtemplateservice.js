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

//Repository
const NotificationTemplateRepository = require('../repository/notificationtemplaterepository.js');
const _repoInstance = new NotificationTemplateRepository();

//Util
const Utility = require('peters-globallib');
const _utilInstance = new Utility();

class NotificationTemplateService {
    constructor(){}

    async list(pParam){
        var xJoResult = {};
        var xJoArrData = [];

        var xResultList = await _repoInstance.list(pParam);

        if( xResultList.count > 0 ){
            var xRows = xResultList.rows;
            for( var index in xRows ){
                xJoArrData.push({
                    id: await _utilInstance.encrypt( (xRows[index].id).toString(), config.cryptoKey.hashKey ),
                    name: xRows[index].name,
                    type: xRows[index].type,
                    subject: xRows[index].subject,
                    body: xRows[index].body,
                    category_id: xRows[index].category_id,
                    code: xRows[index].code,
                    created_at: xRows[index].createdAt,
                    created_by_name: xRows[index].created_by_name,
                    updated_at: xRows[index].updatedAt,
                    updated_by_name: xRows[index].updated_by_name,
                });
            }
            xJoResult = {
                status_code: "00",
                status_msg: "OK",
                data: xJoArrData,
                total_record: xResultList.count,
            }
        }else{
            xJoResult = {
                status_code: "-99",
                status_msg: "Data not found",
            };
        }

        return xJoResult;
    }

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

        if( xFlagProcess )xJoResult = await _repoInstance.getById(pParam);

        return xJoResult;
    }

    async getByCode(pParam){
        var xJoResult = {};
        var xFlagProcess = true;
        var xResult = null;

        if( xFlagProcess ){
            xResult = await _repoInstance.getByCode(pParam);
            if( xResult != null ){
                xJoResult = {
                    status_code: '00',
                    status_msg: 'OK',
                    data: xResult
                }
            }else{
                xJoResult = {
                    status_code: '-99',
                    status_msg: 'Data not found'
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

            console.log(JSON.stringify(pParam));

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

        if( xFlagProcess ){

            

            var xDeleteResult = await _repoInstance.delete( pParam );
            xJoResult = xDeleteResult;
            
        }

        return xJoResult;
    }

}

module.exports = NotificationTemplateService;
