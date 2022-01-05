var env = process.env.NODE_ENV || 'localhost';
var config = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(config.database, config.username, config.password, config);
const { hash } = require('bcryptjs');
const Op = sequelize.Op;

//Model
const _modelDb = require('../models').ms_useruserlevels;
const _modelUser = require('../models').ms_users;
const _modelUserLevel = require('../models').ms_userlevels;
const _modelApp = require('../models').ms_applications;

const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();



class UserUserLevelRepository{
    constructor(){}

    async list( pParam ){

        var xWhere = {};

        var xOrder = ['id', 'ASC'];
        var xInclude = [
            {
                model: _modelUserLevel,
                as: 'user_level',
                include: [
                    {
                        model: _modelApp,
                        as: 'application',
                    }
                ]
            },
            {
                model: _modelUser,
                as: 'user',
            }
        ];

        if( pParam.hasOwnProperty('employee_user_id') ){
            if( pParam.employee_user_id != '' ){
                xWhere = {
                    user_id: pParam.employee_user_id,
                }
            }
        }

        if( pParam.hasOwnProperty('employee_id') ){
            if( pParam.employee_id != '' ){
                xWhere = {
                    '$user.employee_id$': pParam.employee_id,
                }
            }
        }

        if( pParam.order_by != '' && pParam.hasOwnProperty('order_by') ){
            xOrder = [pParam.order_by, (pParam.order_type == 'desc' ? 'DESC' : 'ASC') ];
        }

        var xParamQuery = {
            where: {
                [Op.and]:[
                    {
                        is_delete: 0
                    },
                    xWhere,
                ],
            },          
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

    async isDataExists( pParam ){
        var data = await _modelDb.findOne({
            where: {
                user_id: pParam.user_id,
                user_level_id: pParam.user_level_id,
            }
        });
        
        return data;
    }

    async getById( pParam ){
        var xData = await _modelDb.findOne({
            where: {
                id: pParam.id,
                is_delete: 0,
            },
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
}

module.exports = UserUserLevelRepository;

