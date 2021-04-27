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
const ApplicationMatrixDocumentRepository = require('../repository/approvalmatrixdocumentrepository.js');
const _documentRepoInstance = new ApplicationMatrixDocumentRepository();

const ApplicationMatrixDocumentUserRepository = require('../repository/approvalmatrixdocumentuserrepository.js');
const _repoInstance = new ApplicationMatrixDocumentUserRepository();

//Util
const Utility = require('peters-globallib');
const { jobs } = require('googleapis/build/src/apis/jobs');
const _utilInstance = new Utility();

class ApprovalMatrixDocumentUserService {
    constructor(){}    

    async confirmDocument(pParam){

        var xJoResult = {};
        var xAct = pParam.act;
        delete pParam.xAct;
        var xFlagProcess = true;
        var xDecId = null;

        if( pParam.hasOwnProperty( 'document_id' ) && pParam.hasOwnProperty('user_id') ){
            if( pParam.document_id != '' && pParam.user_id != '' ){
                xDecId = await _utilInstance.decrypt( pParam.document_id, config.cryptoKey.hashKey );
                if( xDecId.status_code == '00' ){
                    pParam.document_id = xDecId.decrypted;
                    xDecId = await _utilInstance.decrypt( pParam.user_id, config.cryptoKey.hashKey );
                    if( xDecId.status_code == '00' ){
                        pParam.user_id = xDecId.decrypted;
                    }else{
                        xJoResult = xDecId;
                        xFlagProcess = false;
                    }
                }else{
                    xJoResult = xDecId;
                    xFlagProcess = false;
                }
            }
        }

        if( xFlagProcess ){

            // Check if this user allow to approve or not
            // console.log(">>> HERE : " + JSON.stringify(pParam));
            var xJoIsAllow = await _documentRepoInstance.isUserAllowApprove( { document_id: pParam.document_id, user_id: pParam.user_id } );
            if( xJoIsAllow.status_code == '00' ){
                if( xJoIsAllow.is_allow_approve == 1 ){
                    pParam.updated_by = pParam.user_id;
                    pParam.updated_by_name = pParam.user_name;

                    var xResultConfirm = await _repoInstance.confirmDocument( pParam );
                    // Check if document already approve all or not
                    var xJoAlreadyApproveAll = await _repoInstance.isDocumentAlreadyApproved( { document_id: pParam.document_id } );
                    if( xJoAlreadyApproveAll.status_code == '00' ){
                        var xDocumentApproved = false;
                        if( xJoAlreadyApproveAll.total == 0 ){
                            xDocumentApproved = true;
                        }
                        xJoResult = xResultConfirm;
                        xJoResult.status_document_approved = xDocumentApproved;

                        // Get Approver User with the status
                        var xJaApprovalMatrixDocument = [];
                        var xResultApprovalMatrixDocument = await _documentRepoInstance.list( {document_id: pParam.document_id} );
                        if( xResultApprovalMatrixDocument != null && xResultApprovalMatrixDocument.count > 0 ){
                            var xRows = xResultApprovalMatrixDocument.rows;
                            for( var i in xRows ){

                                var xJaApproverUser = [];
                                var xJaDataApproverUser = xRows[i].approval_matrix_document_user;
                                for( var j in xJaDataApproverUser ){
                                    xJaApproverUser.push({
                                        user_id: xJaDataApproverUser[j].user.id,
                                        user_name: xJaDataApproverUser[j].user.name,
                                        email: xJaDataApproverUser[j].user.email,
                                        status: xJaDataApproverUser[j].status,
                                    })
                                }

                                xJaApprovalMatrixDocument.push({
                                    sequence: xRows[i].sequence,
                                    approver_user: xJaApproverUser,
                                });
                            }
                        }

                        xJoResult.approvers = xJaApprovalMatrixDocument;

                    }else{
                        xJoResult = xJoAlreadyApproveAll;
                    }
                }else{
                    xJoResult = {
                        status_code: '-99',
                        status_msg: 'You not allow to approve this document.',
                    }
                }
            }else{
                xJoResult = xJoIsAllow;
            }
            
        }

        return xJoResult;
    }

    async confirmDocumentViaEmail(pParam){

        var xJoResult = {};
        var xFlagProcess = true;
        var xDecId = null;

        // if( pParam.hasOwnProperty( 'document_id' ) && pParam.hasOwnProperty('user_id') ){
        //     if( pParam.document_id != '' && pParam.user_id != '' ){
        //         xDecId = await _utilInstance.decrypt( pParam.document_id, config.cryptoKey.hashKey );
        //         if( xDecId.status_code == '00' ){
        //             pParam.document_id = xDecId.decrypted;                    
        //         }else{
        //             xJoResult = xDecId;
        //             xFlagProcess = false;
        //         }
        //     }
        // }

        if( xFlagProcess ){

            // Check if this user allow to approve or not
            // console.log(">>> HERE : " + JSON.stringify(pParam));
            var xJoIsAllow = await _documentRepoInstance.isUserAllowApprove( { document_id: pParam.document_id, user_id: pParam.user_id } );
            if( xJoIsAllow.status_code == '00' ){
                if( xJoIsAllow.is_allow_approve == 1 ){
                    pParam.updated_by = pParam.user_id;
                    // pParam.updated_by_name = pParam.user_name;

                    var xResultConfirm = await _repoInstance.confirmDocument( pParam );
                    // Check if document already approve all or not
                    var xJoAlreadyApproveAll = await _repoInstance.isDocumentAlreadyApproved( { document_id: pParam.document_id } );
                    if( xJoAlreadyApproveAll.status_code == '00' ){
                        var xDocumentApproved = false;
                        if( xJoAlreadyApproveAll.total == 0 ){
                            xDocumentApproved = true;
                        }
                        xJoResult = xResultConfirm;
                        xJoResult.status_document_approved = xDocumentApproved;

                        // Get Approver User with the status
                        var xJaApprovalMatrixDocument = [];
                        var xResultApprovalMatrixDocument = await _documentRepoInstance.list( {document_id: pParam.document_id} );
                        if( xResultApprovalMatrixDocument != null && xResultApprovalMatrixDocument.count > 0 ){
                            var xRows = xResultApprovalMatrixDocument.rows;
                            for( var i in xRows ){

                                var xJaApproverUser = [];
                                var xJaDataApproverUser = xRows[i].approval_matrix_document_user;
                                for( var j in xJaDataApproverUser ){
                                    xJaApproverUser.push({
                                        user_id: xJaDataApproverUser[j].user.id,
                                        user_name: xJaDataApproverUser[j].user.name,
                                        email: xJaDataApproverUser[j].user.email,
                                        status: xJaDataApproverUser[j].status,
                                    })
                                }

                                xJaApprovalMatrixDocument.push({
                                    sequence: xRows[i].sequence,
                                    approver_user: xJaApproverUser,
                                });
                            }
                        }

                        xJoResult.approvers = xJaApprovalMatrixDocument;

                    }else{
                        xJoResult = xJoAlreadyApproveAll;
                    }
                }else{
                    xJoResult = {
                        status_code: '-99',
                        status_msg: 'You not allow to approve this document.',
                    }
                }
            }else{
                xJoResult = xJoIsAllow;
            }
            
        }

        return xJoResult;
    }

    async delete( pParam ){
        var xJoResult;
        var xFlagProcess = true;  

        var xDecId = await _utilInstance.decrypt(pParam.document_id, config.cryptoKey.hashKey);
        if( xDecId.status_code == "00" ){
            pParam.document_id = xDecId.decrypted;                               
        }else{
            xFlagProcess = false;
            xJoResult = xDecId;
        }

        var xDeleteResult = await _repoInstance.deletePermanent( pParam );
        xJoResult = xDeleteResult;

        return xJoResult;
    }

}

module.exports = ApprovalMatrixDocumentUserService;