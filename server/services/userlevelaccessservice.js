const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');

const env         = process.env.NODE_ENV || 'localhost';
const config      = require(__dirname + '/../config/config.json')[env];

// Utility
const Util = require('peters-globallib');
const _utilInstance = new Util();

// Repository
const UserLevelAccessRepository = require( '../repository/userlevelaccessrepository.js' );
const _userLevelAccessRepository = new UserLevelAccessRepository();

class UserLevelAccessService{
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

        if( xFlagProcess )xJoResult = await _userLevelAccessRepository.getById(pParam);

        return xJoResult;
    }

    async getByMenuIdAndLevelId(pParam){
        var xJoResult = {};
        var xFlagProcess = true;

        if( xFlagProcess )xJoResult = await _userLevelAccessRepository.getByMenuIdAndLevelId(pParam);

        return xJoResult;
    }

    async list(pParam){
        var xJoResult = {};
        var xJoArrData = [];       
        var xFlagProcess = true;

        if( pParam.hasOwnProperty('level_id') && pParam.level_id != '' ){
            var xDecId = await _utilInstance.decrypt( pParam.level_id, config.cryptoKey.hashKey );
            if( xDecId.status_code == '00' ){
                pParam.level_id = xDecId.decrypted;
            }else{
                xFlagProcess = false;
                xJoResult = xDecId;
            }
        }

        if( xFlagProcess ){
            var xResultList = await _userLevelAccessRepository.list(pParam);

            if( xResultList.count > 0 ){
                xJoResult.status_code = "00";
                xJoResult.status_msg = "OK";
                xJoResult.total_record = xResultList.count;

                var xRows = xResultList.rows;

                for(var index in xRows){                

                    xJoArrData.push({
                        id: await _utilInstance.encrypt((xRows[index].id).toString(), config.cryptoKey.hashKey),
                        menu: xRows[index].menu,
                        create_perm: xRows[index].create_perm,
                        read_perm: xRows[index].read_perm,
                        update_perm: xRows[index].update_perm,
                        delete_perm: xRows[index].delete_perm,
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
            
            xDecId = await _utilInstance.decrypt( pParam.level_id, config.cryptoKey.hashKey );
            if( xDecId.status_code == '00' ){
                pParam.level_id = xDecId.decrypted;
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
                
        }else{
            xFlagProcess = false;
            xJoResult = xDecId;
        }

        if( xFlagProcess )xJoResult = await _userLevelAccessRepository.save(pParam, xAct);

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
            var xJoResult = await _userLevelAccessRepository.delete( pParam );       
        }

        return xJoResult;

    }
}

module.exports = UserLevelAccessService;