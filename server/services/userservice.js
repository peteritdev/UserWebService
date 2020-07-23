const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
var config = require('../config/config.json');

// Model
const modelUser = require('../models').ms_users;

//Repository
const UserRepository = require('../repository/userrepository.js');
const userRepoInstance = new UserRepository();

class UserService {

    constructor(){}

    async doRegister(param){

        var joResult;
        var result = await userRepoInstance.isEmailExists( param.email );

        if( result == null ){

            joResult = userRepoInstance.registerUser( param );

            return JSON.stringify({
                "status_code":"00",
                "status_msg":"OK",
                "data": param,
                "result_check_email": result,
                "result_add": joResult
            });
        }else{
            return JSON.stringify({
                "status_code":"-99",
                "status_msg":"Email already registered",
                "data": param
            });
        }

        
    }

};

module.exports = UserService;