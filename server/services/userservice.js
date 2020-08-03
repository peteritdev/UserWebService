const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');

var config = require('../config/config.json');

// Model
const modelUser = require('../models').ms_users;

//Repository
const UserRepository = require('../repository/userrepository.js');
const userRepoInstance = new UserRepository();

// Utility
const Util = require('../utils/globalutility.js');
const user = require('../controllers/user');
const utilInstance = new Util();
const UtilSecurity = require('../utils/security.js');
const utilSecureInstance = new UtilSecurity();

class UserService {

    constructor(){}

    async doRegister(param){

        var joResult;
        var result = await userRepoInstance.isEmailExists( param.email );

        if( result == null ){

            joResult = await userRepoInstance.registerUser( param );

            if( joResult.status_code == "00" ){
                //Prepare to send notification
                var notifyParam = {
                    "email": param.email,
                    "id": joResult.created_id,
                    "name": param.name
                }

                var resultNotify = await utilInstance.axiosRequest(config.api.notification.emailVerification, "POST", notifyParam);
                //console.log(">>> Result Notify : " + resultNotify);

                return JSON.stringify({
                    "status_code":"00",
                    "status_msg":"OK",
                    "data": param,
                    "result_check_email": result,
                    "result_add": joResult,
                    "result_send_email_verification": resultNotify
                });
            }           
            
        }else{
            return JSON.stringify({
                "status_code":"-99",
                "status_msg":"Email already registered",
                "data": param
            });
        }

        
    }

    async doVerifyAccount(param){
        var decryptedVerificationCode = await utilInstance.decrypt( param.code );
        if( decryptedVerificationCode.status_code == "00" ){
            var splittedDecryptedCode = decryptedVerificationCode.decrypted.split(config.frontParam.separatorData);
            var email = splittedDecryptedCode[0];
            var id = splittedDecryptedCode[1];
            var verify = await userRepoInstance.verifyVerificationCode( email, id );
            if( verify == null ){
                return JSON.stringify({
                    "status_code": "-99",
                    "status_msg": "Code verification not valid"
                });
            }else{
                var verifyResult = await userRepoInstance.activateUser( id );
                if( verifyResult.status_code == "00" ){
                    return JSON.stringify({
                        "status_code": "00",
                        "status_msg": "You've susscessfully verified your account. Now you can login to your homepage"
                    });
                }
            }
        }else{
            return JSON.stringify({
                "status_code": "-99",
                "status_msg": "Invalid formula of code verification",
                "err_msg": decryptedVerificationCode.status_msg
            });
        }
    }

    async doLogin( param ){
        var validateEmail = await userRepoInstance.isEmailExists( param.email );
        if( validateEmail != null ){
            var validatePassword = await bcrypt.compare(param.password, validateEmail.password);
            if( validatePassword ){

                //Generate JWT Token
                let token = jwt.sign({email:param.email,id:validateEmail.id},config.secret,{expiresIn:config.login.expireToken});

                return JSON.stringify({
                    "status_code": "00",
                    "status_msg": "Login successfully",
                    "token": token
                });
            }else{
                return JSON.stringify({
                    "status_code": "-99",
                    "status_msg": "Email or password not valid"
                });
            }
        }else{
            return JSON.stringify({
                "status_code": "-99",
                "status_msg": "Email or password not valid"
            });
        }
    }

    async doForgotPassword( param ){
        var validateEmail = await userRepoInstance.isEmailExists( param.email );
        if( validateEmail != null ){
            var forgotPasswordCode = "FORGOTPASSWORD" + config.frontParam.separatorData + param.email + config.frontParam.separatorData + validateEmail.id;
            forgotPasswordCode = await utilInstance.encrypt(forgotPasswordCode);
            var verificationLink = config.frontParam.forgotPasswordLink;
            verificationLink = verificationLink.replace("#VERIFICATION_CODE#", forgotPasswordCode);

            //Prepare parameter and send to notification service
            var notifyParam = {
                "email": param.email,
                "name": validateEmail.name,
                "verification_link": verificationLink

            }
            var resultNotify = await utilInstance.axiosRequest(config.api.notification.forgotPassword, "POST", notifyParam);

            if( resultNotify.status_code == "00" ){
                //Update status in database
                var resultUpdate = await userRepoInstance.forgotPassword(param.email);
 
                if( resultUpdate.status_code == "00" ){
                    return JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        "result_send_email_verification": resultNotify
                    });
                }else{
                    return JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Update status forgot password failed",
                        "result_send_email_verification": resultNotify
                    });
                }
                
            }            
            
        }
    }

    async doVerifyForgotPasswordCode(param){
        var decryptedVerificationCode = await utilInstance.decrypt( param.code );
        if( decryptedVerificationCode.status_code == "00" ){
            var splittedDecryptedCode = decryptedVerificationCode.decrypted.split(config.frontParam.separatorData);
            var prefix = splittedDecryptedCode[0];
            var email = splittedDecryptedCode[1];
            var id = splittedDecryptedCode[2];
            var verify = await userRepoInstance.verifyVerificationCode( email, id );

            if( prefix == "FORGOTPASSWORD" ){
                if( verify == null ){
                    return JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Code verification not valid"
                    });
                }else{
                    var verifyResult = await userRepoInstance.activateUser( id );
                    if( verifyResult.status_code == "00" ){
                        return JSON.stringify({
                            "status_code": "00",
                            "status_msg": "Please input your new password"
                        });
                    }
                }
            }else{
                return JSON.stringify({
                    "status_code": "-99",
                    "status_msg": "Invalid formula of code verification", 
                });
            }
            
        }else{
            return JSON.stringify({
                "status_code": "-99",
                "status_msg": "Invalid formula of code verification",
                "err_msg": decryptedVerificationCode.status_msg
            });
        }
    }

};

module.exports = UserService;