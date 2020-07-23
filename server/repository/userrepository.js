var env = process.env.NODE_ENV || 'development';
var configEnv = require(__dirname + '/../config/config.json')[env];
var Sequelize = require('sequelize');
var sequelize = new Sequelize(configEnv.database, configEnv.username, configEnv.password, configEnv);
const { hash } = require('bcryptjs');

//Model
const modelUser = require('../models').ms_users;

//Utils
const UtilSecurity = require('../utils/security.js');
const utilSecureInstance = new UtilSecurity();
const Util = require('../utils/globalutility.js');
const utilInstance = new Util();

class UserRepository {
    constructor(){}

    async isEmailExists( pEmail ){
        var data = await modelUser.findOne({
            where:{
                email: pEmail
            }
        });
        
        return data;
    }

    async registerUser( param ){
        let transaction;
        var joResult;
        var hashedPassword = '';

        try{
            transaction = await sequelize.transaction();           
            hashedPassword = await utilSecureInstance.generatePassword(param.password);
            console.log(">>> Hashed Password : " + hashedPassword);

            await modelUser.create({
                name: param.name,
                email: param.email,
                password: hashedPassword,
                is_first_login: 1,
                status: 0,
                created_at: utilInstance.getCurrDateTime()                
            },{transaction});
            
            await transaction.commit();

            joResult = JSON.stringify({
                "status_code": "00",
                "status_msg": "User successfully add to database"
            });
        }catch(err){
            console.log("ERROR [UserRepository.RegisterUser] " + err);
            if( transaction ) await transaction.rollback();
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg": "Failed add user to database",
                "err_msg": err
            });
        }

        return joResult;
    }
};

module.exports = UserRepository;