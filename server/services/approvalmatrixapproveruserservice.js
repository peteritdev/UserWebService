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
const ApprovalMatrixApproverUserRepository = require('../repository/approvalmatrixapproveruserrepository.js');
const _repoInstance = new ApprovalMatrixApproverUserRepository();

//Util
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

class ApprovalMatrixApproverUserService {
    constructor(){}

    async list(pParam){
        var xJoResult = {};
        var xJoArrData = [];       
        var xFlagProcess = true;

        var xDecId = await _utilInstance.decrypt( pParam.approval_matrix_approver_id, config.cryptoKey.hashKey );
        if( xDecId.status_code == '00' ){
            pParam.approval_matrix_approver_id = xDecId.decrypted;
        }else{
            xFlagProcess = false;
            xJoResult = xDecId;
        }

        if( xFlagProcess ){
            var xResultList = await _repoInstance.list(pParam);

            if( xResultList.count > 0 ){
                xJoResult.status_code = "00";
                xJoResult.status_msg = "OK";
                xJoResult.total_record = xResultList.count;

                var xRows = xResultList.rows;

                for(var index in xRows){                

                    xJoArrData.push({
                        id: await _utilInstance.encrypt((xRows[index].id).toString(), config.cryptoKey.hashKey),
                        approval_matrix_approver_id: await _utilInstance.encrypt((xRows[index].approval_matrix_approver_id).toString(), config.cryptoKey.hashKey),
                        user: xRows[index].user,
                        created_at: moment(xRows[index].createdAt).format('DD-MM-YYYY HH:mm:ss'),
                        updated_at: moment(xRows[index].updatedAt).format('DD-MM-YYYY HH:mm:ss'),
                    });
                }

                xJoResult.data = xJoArrData;
            }else{
                xJoResult.status_code = "-99";
                xJoResult.status_msg = "Data not found";
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
                        id: await _utilInstance.encrypt((xData.id).toString(), config.cryptoKey.hashKey),
                        approval_matrix_approver_id: await _utilInstance.encrypt((xData.approval_matrix_approver_id).toString(), config.cryptoKey.hashKey),
                        user: xData.user,
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
            
            // Approval matrix approver
            var xDecId = await _utilInstance.decrypt( pParam.approval_matrix_approver_id, config.cryptoKey.hashKey );
            if( xDecId.status_code == '00' ){
                pParam.approval_matrix_approver_id = xDecId.decrypted;
                xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
                if( xDecId.status_code == '00' ){
                    pParam.created_by = xDecId.decrypted;
                    pParam.created_by_name = pParam.user_name;
                    pParam.user_id = pParam.approver_user_id;
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


        }else if( xAct == "update" ){

            var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
            if( xDecId.status_code == "00" ){
                pParam.id = xDecId.decrypted;                    
                xDecId = await _utilInstance.decrypt( pParam.approval_matrix_approver_id, config.cryptoKey.hashKey );
                if( xDecId.status_code == '00' ){
                    pParam.approval_matrix_approver_id = xDecId.decrypted;
                    xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
                    if( xDecId.status_code == '00' ){
                        pParam.created_by = xDecId.decrypted;
                        pParam.created_by_name = pParam.user_name;
                        pParam.user_id = pParam.approver_user_id;
                    }else{
                        xFlagProcess = false;
                        xJoResult = xDecId;
                    }
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

module.exports = ApprovalMatrixApproverUserService;