var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const { hash } = require('bcryptjs');
const Op = sequelize.Op;

//Model
const _modelDb = require('../models').ms_approvalmatrixapprovers;
const _modelApprovalMatrixApproverUser = require('../models').ms_approvalmatrixapproverusers;
const _modelUser = require('../models').ms_users;
const _modelApprovalMatrix = require('../models').ms_approvalmatrix;
const _modelApplicationTable = require('../models').ms_applicationtables;
const _modelApplication = require('../models').ms_applications;

const Utility = require('peters-globallib');
const _utilInstance = new Utility();

class ApprovalMatrixApproverRepository {
    constructor(){}

    async list( pParam ){

        var xWhere = {};
        var xWhereAnd = [];

        var xOrder = ['id', 'ASC'];
        var xInclude = [
            {
                model: _modelApprovalMatrix,
                as: 'approval_matrix',
                include: [
                    {
                        model: _modelApplicationTable,
                        as: 'application_table',
                        // where: xWhereTable,
                        include: [
                            {
                                model: _modelApplication,
                                as: 'application',
                                // where: xWhereApplication,
                            }
                        ]
                    }
                ]
            },
            {
                attributes: ['id'],
                model: _modelApprovalMatrixApproverUser,
                as: 'approval_matrix_approver_user',
                include: [
                    {
                        attributes: ['id','name', 'email'],
                        model: _modelUser,
                        as: 'user',
                    }
                ],
            }
        ];

        if( pParam.hasOwnProperty('application_id') ){
            if( pParam.application_id != '' ){
                xWhereAnd.push({
                    '$approval_matrix.application_table.application.id$':pParam.application_id,
                })
            }
        }

        if( pParam.hasOwnProperty('table_name') ){
            if( pParam.table_name != '' ){
                xWhereAnd.push({
                    '$approval_matrix.application_table.table_name$':pParam.table_name,
                })
            }
        }

        if( pParam.hasOwnProperty('approval_matrix_id') ){
            if( pParam.approval_matrix_id != '' ){
                xWhereAnd.push({
                    approval_matrix_id:pParam.approval_matrix_id,
                })
            }
        }

        xWhereAnd.push({
            is_delete: 0
        });

        xWhere.$and = xWhereAnd;  

        if( pParam.order_by != '' && pParam.hasOwnProperty('order_by') ){
            xOrder = [pParam.order_by, (pParam.order_type == 'desc' ? 'DESC' : 'ASC') ];
        }

        var xParamQuery = {
            where: xWhere,        
            include: xInclude,  
            order: [xOrder],
        };

        if( pParam.hasOwnProperty('offset') && pParam.hasOwnProperty('limit') ){
            if( pParam.offset != '' && pParam.limit != ''){
                xParamQuery.offset = pParam.offset;
                xParamQuery.limit = pParam.limit;
            }
        }

        var xData = await _modelDb.findAndCountAll(xParamQuery);

        return xData;
    }

    async getById( pParam ){

        var xWhere = {};
        var xWhereAnd = [];    

        var xInclude = [
            {
                model: _modelApprovalMatrix,
                as: 'approval_matrix',
                include: [
                    {
                        model: _modelApplicationTable,
                        as: 'application_table',
                        // where: xWhereTable,
                        include: [
                            {
                                model: _modelApplication,
                                as: 'application',
                                // where: xWhereApplication,
                            }
                        ]
                    }
                ]
            },
            {
                attributes: ['id'],
                model: _modelApprovalMatrixApproverUser,
                as: 'approval_matrix_approver_user',
                include: [
                    {
                        attributes: ['id','name', 'email'],
                        model: _modelUser,
                        as: 'user',
                    }
                ],
            }
        ];

        if( pParam.hasOwnProperty('application_id') ){
            if( pParam.application_id != '' ){
                xWhereAnd.push({
                    '$approval_matrix.application_table.application.id$':pParam.application_id,
                })
            }
        }

        if( pParam.hasOwnProperty('table_name') ){
            if( pParam.table_name != '' ){
                xWhereAnd.push({
                    '$approval_matrix.application_table.table_name$':pParam.table_name,
                })
            }
        }

        xWhereAnd.push({
            is_delete: 0
        });

        if( pParam.hasOwnProperty('id') ){
            if( pParam.id != '' ){
                xWhereAnd.push({
                    id: pParam.id,
                })
            }
        }

        xWhere.$and = xWhereAnd;        

        var xData = await _modelDb.findAndCountAll({
            where: xWhere,
            include: xInclude,
        });

        return xData;
    }

    async save(pParam, pAct){
        let xTransaction;
        var xJoResult = {};
        
        try{

            var xSaved = null;
            xTransaction = await sequelize.transaction();

            if( pAct == "add" ){

                pParam.status = 1;
                pParam.is_delete = 0;

                xSaved = await _modelDb.create(pParam, {xTransaction}); 

                if( xSaved.id != null ){

                    await xTransaction.commit();

                    xJoResult = {
                        status_code: "00",
                        status_msg: "Data has been successfully saved",
                        created_id: await _utilInstance.encrypt( (xSaved.id).toString(), config.cryptoKey.hashKey ),
                    }                     
                    

                }else{

                    if( xTransaction ) await xTransaction.rollback();

                    xJoResult = {
                        status_code: "-99",
                        status_msg: "Failed save to database",
                    }

                }                

            }else if( pAct == "add_with_detail" ){

                pParam.status = 1;
                pParam.is_delete = 0;

                xSaved = await _modelDb.create(pParam, 
                                               {
                                                include: [
                                                    {
                                                        model: _modelApprovalMatrixApproverUser,
                                                        as: 'approval_matrix_approver_user'
                                                    }
                                                ],
                                               },
                                               {xTransaction}); 

                if( xSaved.id != null ){

                    await xTransaction.commit();

                    xJoResult = {
                        status_code: "00",
                        status_msg: "Data has been successfully saved",
                        created_id: await _utilInstance.encrypt( (xSaved.id).toString(), config.cryptoKey.hashKey ),
                    }                     
                    

                }else{

                    if( xTransaction ) await xTransaction.rollback();

                    xJoResult = {
                        status_code: "-99",
                        status_msg: "Failed save to database",
                    }

                }                

            }else if( pAct == "update" ){
                
                pParam.updatedAt = await _utilInstance.getCurrDateTime();
                var xId = pParam.id;
                delete pParam.id;
                var xWhere = {
                    where : {
                        id: xId,
                    }
                };
                xSaved = await _modelDb.update( pParam, xWhere, {xTransaction} );

                await xTransaction.commit();

                xJoResult = {
                    status_code: "00",
                    status_msg: "Data has been successfully updated"
                }

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

    async delete( pParam ){
        let xTransaction;
        var xJoResult = {};

        try{
            var xSaved = null;
            xTransaction = await sequelize.transaction();

            xSaved = await _modelDb.update(
                {
                    is_delete: 1,
                    deleted_by: pParam.deleted_by,
                    deleted_by_name: pParam.deleted_by_name,
                    deleted_at: await _utilInstance.getCurrDateTime(),
                },
                {
                    where: {
                        id: pParam.id
                    }
                },
                {xTransaction}
            );
    
            await xTransaction.commit();

            xJoResult = {
                status_code: "00",
                status_msg: "Data has been successfully deleted",
            }

            return xJoResult;

        }catch(e){
            if( xTransaction ) await xTransaction.rollback();
            xJoResult = {
                status_code: "-99",
                status_msg: "Failed save or update data",
                err_msg: e
            }

            return xJoResult;
        }
    }

    async deletePermanent( pParam ){
        let xTransaction;
        var xJoResult = {};

        try{
            var xSaved = null;
            xTransaction = await sequelize.transaction();

            xSaved = await _modelDb.destroy(
                {
                    where: {
                        id: pParam.id,
                    },
                },
                {xTransaction});
    
            await xTransaction.commit();

            xJoResult = {
                status_code: "00",
                status_msg: "Data has been successfully deleted",
            }

            return xJoResult;

        }catch(e){
            if( xTransaction ) await xTransaction.rollback();
            xJoResult = {
                status_code: "-99",
                status_msg: "Failed delete data",
                err_msg: e
            }

            return xJoResult;
        }
    }
}

module.exports = ApprovalMatrixApproverRepository;

