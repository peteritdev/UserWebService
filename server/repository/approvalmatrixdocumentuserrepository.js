var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const { hash } = require('bcryptjs');
const Op = sequelize.Op;

//Model
const _modelDb = require('../models').tr_approvalmatrixdocumentusers;
const _modelDocumentDb = require('../models').tr_approvalmatrixdocuments;

const Utility = require('peters-globallib');
const _utilInstance = new Utility();

class ApprovalMatrixDocumentUserRepository {
    constructor(){}    

    async confirmDocument(pParam, pAct){
        let xTransaction;
        var xJoResult = {};
        
        try{

            var xSaved = null;
            xTransaction = await sequelize.transaction();
            
            var xSql = ' UPDATE tr_approvalmatrixdocumentusers SET status = :status ' + 
                             ' FROM tr_approvalmatrixdocuments WHERE tr_approvalmatrixdocuments.id = tr_approvalmatrixdocumentusers.approval_matrix_document_id ' + 
                             ' AND tr_approvalmatrixdocuments.document_id = :documentId ' + 
                             ' AND tr_approvalmatrixdocumentusers.user_id = :userId ' ;

            var xUpdate = await sequelize.query( xSql, {
                replacements: {
                    status: pParam.status,
                    documentId: pParam.document_id,
                    userId: pParam.user_id
                }},
                {xTransaction},
            );

            await xTransaction.commit();

            xJoResult = {
                status_code: "00",
                status_msg: "Data has been successfully confirmed"
            }

        }catch(e){
            if( xTransaction ) await xTransaction.rollback();
            xJoResult = {
                status_code: "-99",
                status_msg: "Failed save or update data. Error : " + e,
                err_msg: e
            }
            
        }
        
        return xJoResult;
    }

    // Note: this function not work when need update with join table
    async confirmDocument_Sequelize(pParam, pAct){
        let xTransaction;
        var xJoResult = {};
        
        try{

            var xSaved = null;
            xTransaction = await sequelize.transaction();
            
            pParam.updatedAt = await _utilInstance.getCurrDateTime();
            var xWhere = {                
                where : {
                    user_id: pParam.user_id,
                },
                include: [
                    {
                        model: _modelDocumentDb,
                        as: 'approval_matrix_document',
                        required: true,
                        where: {
                            document_id: pParam.document_id,
                        }
                    }
                ],
            };
            xSaved = await _modelDb.update( pParam, xWhere, {xTransaction} );

            await xTransaction.commit();

            xJoResult = {
                status_code: "00",
                status_msg: "Data has been successfully confirmed"
            }

        }catch(e){
            if( xTransaction ) await xTransaction.rollback();
            xJoResult = {
                status_code: "-99",
                status_msg: "Failed save or update data. Error : " + e,
                err_msg: e
            }
            
        }
        
        return xJoResult;
    }

    async isDocumentAlreadyApproved( pParam ){
        var xJoResult = {};
        var xSql = "";
        var xObjJsonWhere = {};

        if( pParam.hasOwnProperty('document_id') ){
            if( pParam.document_id != '' ){
                xObjJsonWhere.documentId = pParam.document_id;
            }
        }

        xSql = ' SELECT COUNT(0) AS total FROM tr_approvalmatrixdocuments WHERE document_id = :documentId AND total_approved < min_approver ';

        var xDtQuery = await sequelize.query(xSql, {
            replacements: xObjJsonWhere,
            type: sequelize.QueryTypes.SELECT,
        });

        if( xDtQuery.length > 0 ){
            xJoResult = {
                status_code: "00",
                status_msg: "OK",
                total: xDtQuery[0].total,
            };
        }else {
            xJoResult = {
              status_code: "-99",
              status_msg: "Data not found"
            };
        }

        return xJoResult;
    }


}

module.exports = ApprovalMatrixDocumentUserRepository;

