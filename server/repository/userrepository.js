var env = process.env.NODE_ENV || 'development';
var configEnv = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const { hash } = require('bcryptjs');
const Op = sequelize.Op;

//Model
const _modelUser = require('../models').ms_users;
const _modelCompany = require('../models').ms_companies;
const _modelUserUserLevel = require('../models').ms_useruserlevels;
const _modelUserLevel = require('../models').ms_userlevels;  
const _modelApplication = require('../models').ms_applications;

//Utils
const UtilSecurity = require('../utils/security.js');
const utilSecureInstance = new UtilSecurity();
const Util = require('../utils/globalutility.js');
const utilInstance = new Util();

class UserRepository {
    constructor(){}

    async getUserByEmployeeId( pId ){
        var data = await _modelUser.findOne({
            where: {
                employee_id: pId,
            },
            include:[
                {
                    model: _modelCompany,
                    as: 'company'
                },
                {
                    attributes: ["id","name"],
                    model: _modelUserLevel,
                    as: 'user_level',
                    through: {
                        attributes: [],
                    },
                    include: [
                        {
                            attributes: ['id','name'],
                            model: _modelApplication,
                            as: 'application',
                        }
                    ]
                }
            ]
        });

        return data;
    }

    async getById( pId ){
        var data = await _modelUser.findOne({
            where: {
                id: pId,
            },
            include:[
                {
                    model: _modelCompany,
                    as: 'company'
                },
                {
                    attributes: ["id","name"],
                    model: _modelUserLevel,
                    as: 'user_level',
                    through: {
                        attributes: [],
                    },
                    include: [
                        {
                            attributes: ['id','name'],
                            model: _modelApplication,
                            as: 'application',
                        }
                    ]
                }
            ]
        });

        return data;
    }

    async isEmailExists( pEmail ){
        var data = await _modelUser.findOne({
            where:{
                email: {
                    [Op.like]: pEmail
                },
            },
            include:[
                {
                    model: _modelCompany,
                    as: 'company'
                },
                {
                    attributes: ["id","name"],
                    model: _modelUserLevel,
                    as: 'user_level',
                    through: {
                        attributes: [],
                        where: {
                            is_delete: 0,
                        }
                    },
                    include: [
                        {
                            attributes: ['id','name'],
                            model: _modelApplication,
                            as: 'application',
                        }
                    ]
                }
            ],
        });
        
        return data;
    }

    async list( param ){

        var jWhereCompany = {};

        if( param.company_id != "" && param.company_id != null ){
            jWhereCompany = {
                "$company.id$": param.company_id
            }
        }

        var data = await _modelUser.findAndCountAll({
            where: {
                [Op.or]:[
                    {
                        name:{
                            [Op.like]: '%' + param.keyword + '%'
                        }
                    },
                    {
                        email:{
                            [Op.like]: '%' + param.keyword + '%'
                        }
                    }
                ],
                [Op.and]:[
                    {
                        // type: 1
                        // '$user_app.is_delete$': 0,
                    },jWhereCompany
                ]

            },
            include:[
                {
                    model: _modelCompany,
                    as: 'company'
                },
                {
                    attributes: ["id","name"],
                    model: _modelUserLevel,
                    as: 'user_level',
                    through: {
                        attributes: [],
                    },
                    include: [
                        {
                            attributes: ['id','name'],
                            model: _modelApplication,
                            as: 'application',
                        }
                    ]
                }
            ],
            limit: param.limit,
            offset: param.offset
        });

        return {
            "status_code": "00",
            "status_msg": "OK",
            "data": data
        };
    }

    async verifyVerificationCode( pEmail, pId ){
        var data = await _modelUser.findOne({
            where:{
                email: pEmail,
                id: pId
            }
        });
        
        return data;
    }

    async registerUser( param ){
        let transaction;
        var joResult = {};
        var hashedPassword = '';

        try{
            transaction = await sequelize.transaction();           
            hashedPassword = await utilSecureInstance.generateEncryptedPassword(param.password);

            var created = null;

            if( param.method == 'conventional' ){
                created = await _modelUser.create({
                    name: param.name,
                    email: param.email,
                    password: hashedPassword,
                    is_first_login: 1,
                    status: param.status,
                    register_with: param.method,
                    type: param.type,
                    sanqua_company_id: param.company_id,
                    employee_id: param.employee_id,
                },{transaction});
            }else if( param.method == 'google' ){
                created = await _modelUser.create({
                    name: param.name,
                    email: param.email,
                    password: hashedPassword,
                    is_first_login: 1,
                    status: 1,
                    google_token: param.google_token,
                    google_token_expire: param.google_token_expire,
                    google_token_id: param.google_token_id,
                    register_with: param.method
                },{transaction});
            }
            
            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "User successfully add to database",
                created_id: created.id,
                google_token: param.google_token,
                google_token_expire: param.google_token_expire,
                google_token_id: param.google_token_id
            };
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.RegisterUser] " + err);
            if( transaction ) await transaction.rollback();
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg": "Failed add user to database",
                "err_msg": err
            });
            return joResult;
        }

        
    }

    async save( param ){
        let transaction;
        var joResult = {};
        var hashedPassword = '';

        // console.log(">>> Update from user : ");
        // console.log(JSON.stringify(param));

        try{
            transaction = await sequelize.transaction();  
            
            if( param.act == "update" || param.act == "update_from_employee" || param.act == "add_from_employee" ){
                var joDataUpdate = {
                    name: param.name,
                    email: param.email,
                    status: param.status,
                    sanqua_company_id: param.company_id,
                    updated_by: param.user_id,
                    employee_id: param.id,
                    user_level_id: param.user_level_id,
                };

                console.log(">>> Update REpo Param : ");
                console.log(">>> param.act : " + JSON.stringify(param));
                console.log(JSON.stringify(joDataUpdate));

                if( param.password != '' && param.hasOwnProperty('password') ){
                    hashedPassword = await utilSecureInstance.generateEncryptedPassword(param.password);
                    joDataUpdate.password = hashedPassword;
                }               
    
                var saved = null;
                var xWhere = {};

                if( param.act == "update" ){
                    xWhere = {
                        id: param.id,
                    };
                }else if(  param.act == "update_from_employee" ){
                    xWhere = {
                        employee_id: param.id,
                    }
                }
                
                if( param.act == "update" || param.act == "update_from_employee"  ){
                    saved = await _modelUser.update(joDataUpdate,
                        {
                            where: xWhere,
                        },
                        {transaction});
                }else if( param.act == "add_from_employee" ){
                    saved = await _modelUser.create(joDataUpdate,{transaction});
                }              
                
            }       
                       
            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "User successfully update to database",
            };
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.SaveUser] " + err);
            if( transaction ) await transaction.rollback();
            joResult = {
                "status_code": "-99",
                "status_msg": "Failed update user to database",
                "err_msg": err
            };
            return joResult;
        }

        
    }

    async activateUser( id ){
        let transaction;
        var joResult = {};
        var currDateTime = await utilInstance.getCurrDateTime();

        try{
            transaction = await sequelize.transaction();
            
            var updated = await _modelUser.update({
                "status": 1,
                "verified_at": currDateTime
            },{
                where:{
                    id: id
                }
            },{transaction});

            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "User successfully activated"
            };
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.ActivateUser] " + err);
            if( transaction ) await transaction.rollback();
            joResult = {
                status_code: "-99",
                status_msg: "Failed to activate user",
                err_msg: err
            };
            return joResult;
        }
    }

    async forgotPassword( pEmail, pNewPassword, pMethod ){
        let transaction;
        var joResult = {};
        var currDateTime = await utilInstance.getCurrDateTime();

        try{
            transaction = await sequelize.transaction();
            
            var xUpdateParam = {};
            if( pMethod == 'link_verification' ){
                xUpdateParam = {
                    "status": 2,
                    "forgot_password_at": currDateTime
                };
            }else if( pMethod == 'generate_new_password' ){
                xUpdateParam = {
                    "forgot_password_at": currDateTime,
                    "password": pNewPassword,
                };
            }

            var updated = await _modelUser.update(xUpdateParam,{
                where:{
                    email: pEmail
                }
            },{transaction});

            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "User successfully did forgot password"
            };
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.ForgotPassword] " + err);
            if( transaction ) await transaction.rollback();
            joResult = {
                status_code: "-99",
                status_msg: "Failed to forgot password process",
                err_msg: err
            };
            return joResult;
        }
    }

    async changePassword( pNewPassword, pEmail, pId ){
        let transaction;
        var joResult = {};
        var currDateTime = await utilInstance.getCurrDateTime();

        try{
            transaction = await sequelize.transaction();
            
            var updated = await _modelUser.update({
                "status": 1,
                "password": pNewPassword
            },{
                where:{
                    email: pEmail,
                    id: pId
                }
            },{transaction});

            await transaction.commit();

            if( updated == 0 ){
                joResult = {
                    status_code: "-98",
                    err_msg: "Verification Code and Id doesn't match. Please check again"
                };
            }else{
                joResult = {
                    status_code: "00",
                    status_msg: "You've successfully change password."
                };
            }
            
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.ChangePassword] " + err);
            if( transaction ) await transaction.rollback();
            joResult = {
                status_code: "-99",
                status_msg: "Failed to change password process",
                err_msg: err
            };
            return joResult;
        }
    }

    async updateGoogleToken( pEmail, pToken, pIdToken, pExpire ){
        let transaction;
        var joResult = {};
        var currDateTime = await utilInstance.getCurrDateTime();

        try{
            transaction = await sequelize.transaction();
            
            var updated = await _modelUser.update({
                "google_token": pToken,
                "google_token_expire": pExpire,
                "google_token_id": pIdToken,
                "last_login": currDateTime
            },{
                where:{
                    email: pEmail
                }
            },{transaction});

            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "User successfully login with Google Account",
                google_token: pToken,
                google_token_expire: pExpire,
                google_token_id: pIdToken
            };
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.UpdateGoogleToken] " + err);
            if( transaction ) await transaction.rollback();
            joResult = {
                status_code: "-99",
                status_msg: "Failed to login with Google Account process",
                err_msg: err
            };
            return joResult;
        }
    }

    async updateVendorID(pId, pVendorId){
        let transaction;
        var joResult = {};
        var currDateTime = await utilInstance.getCurrDateTime();

        try{
            transaction = await sequelize.transaction();
            
            var updated = await _modelUser.update({
                vendor_id: pVendorId,
            },{
                where:{
                    id: pId
                }
            },{transaction});

            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "User successfully with Vendor ID",
            };
            return joResult;
        }catch(err){
            console.log("ERROR [UserRepository.UpdateVendorID] " + err);
            if( transaction ) await transaction.rollback();
            joResult = {
                status_code: "-99",
                status_msg: "Failed to update user with Vendor ID",
                err_msg: err
            };
            return joResult;
        }
    }

    async delete( param ){
        let transaction;
        var joResult = {};

        try{
		
			var saved = null;
            transaction = await sequelize.transaction();
            saved = await _modelUser.destroy({
                where: {
                    id: param.id
                }
            });

            await transaction.commit();

            joResult = {
                status_code: "00",
                status_msg: "Data successfully deleted"
            }
        }catch(e){
            if( transaction ) await transaction.rollback();
            joResult = {
                status_code: "-99",
                status_msg: "Failed delete data",
                err_msg: e
            }
        }

        return joResult;
    }
};

module.exports = UserRepository;