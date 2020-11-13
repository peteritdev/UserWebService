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
const utilInstance = new Util();
const UtilSecurity = require('../utils/security.js');
const utilSecureInstance = new UtilSecurity();
const GoogleUtil = require('../utils/googleutil.js');
const googleUtilInstance = new GoogleUtil();
const JwtUtil = require('../utils/jwtutil.js');
const jwtUtilInstance = new JwtUtil();

class UserService {

    constructor(){}

    async list(param){
        var joResult = {};
        var joArrData = [];       

        var xResultList = await userRepoInstance.list(param);

        if( xResultList.data.count > 0 ){
            joResult.status_code = "00";
            joResult.status_msg = "OK";
            joResult.recordsTotal = xResultList.count;
            joResult.recordsFiltered = xResultList.count;
            joResult.draw = param.draw;

            var xRows = xResultList.data.rows;

            for(var index in xRows){
                joArrData.push({
                    id: await utilInstance.encrypt((xRows[index].id).toString()),
                    name: xRows[index].name,
                    email: xRows[index].email,
                    company_id: ( xRows[index].company != null ? xRows[index].company.id : null ),
                    company_name: ( xRows[index].company != null ? xRows[index].company.name : '' ),
                    status: xRows[index].status
                });
            }

            joResult.data = joArrData;
        }else{
            joResult.status_code = "00";
            joResult.status_msg = "OK";
            joResult.recordsTotal = xResultList.count;
            joResult.recordsFiltered = xResultList.count;
            joResult.draw = param.draw;
            joResult.data = joArrData;
        }

        return (joResult);
    }

    async doRegister(param){

        var joResult;
        var result = await userRepoInstance.isEmailExists( param.email );

        

        if( result == null ){

            joResult = await userRepoInstance.registerUser( param );

            if( joResult.status_code == "00" ){

                var resultNotify = null;
                
                //Prepare to send notification if registration method using conventional
                if( param.method == 'conventional' ){  
                    
                    if( param.type == 1 ){
                        param.status = 1;
                    }else if( param.type == 2 ){    
                        var notifyParam = {
                            "email": param.email,
                            "id": joResult.created_id,
                            "name": param.name
                        }
                        resultNotify = await utilInstance.axiosRequest(config.api.notification.emailVerification, "POST", notifyParam);
                    }
                    
                }

                return JSON.stringify({
                    "status_code":"00",
                    "status_msg":joResult.status_msg,
                    "data": param,
                    "result_check_email": result,
                    "result_add": joResult,
                    "result_send_email_verification": ( resultNotify !== null ? resultNotify.data : null )
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

    async save(param){
        var joResult;
        var checkDuplicateResult = await userRepoInstance.isEmailExists(param.email);
        var flagProcess = true;
        var flagExistEmail = true;
        var xDec = null;
        var xCheckEmail = null;

        if( ( param.act == "add" && checkDuplicateResult == null ) || param.act == "update" || param.act == "update_from_employee" ){

            if( param.act == "update" || param.act == "update_from_employee" ){

                if( param.act == "update" ){
                    xDec = await utilInstance.decrypt(param.id);
                }else if( param.act == "update_from_employee" ){
                    xDec = await utilInstance.decrypt(param.employee_id);
                }

                param.id = xDec.decrypted;

                // Check existing email
                xCheckEmail = await userRepoInstance.isEmailExists( param.email );
                if( xCheckEmail != null ){
                    if( xCheckEmail.id != param.id ){
                        flagExistEmail = false;
                    }
                }

            }
            
            if( ( (param.act == "update" || param.act == "update_from_employee") && xDec.status_code == "00" ) || ( param.act == "add" ) ){  
                
                if( param.act == "update" && !flagExistEmail ){
                    flagProcess = false;
                    joResult = {
                        status_code: "-99",
                        status_msg: "Email already exists"
                    };
                }else{
                    
                    if( param.hasOwnProperty("user_id") ){
                        var xDecUserId = await utilInstance.decrypt(param.user_id);
                        if( xDecUserId.status_code == "00" ){
                            param.user_id = xDecUserId.decrypted;                    
                        }else{
                            flagProcess = false;
                            joResult = xDecUserId;
                        }
                    }
                       
                }               
                                 
            }else{
                flagProcess = false;
                joResult = xDec; 
            }       
            
            if( flagProcess )joResult = await userRepoInstance.save( param );

        }else{
            joResult = {
                status_code: "01",
                status_msg: "Data already exist in database"
            }
        }

        return (joResult);
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

                // Generate JWT Token
                let token = jwt.sign({email:param.email,id:validateEmail.id},config.secret,{expiresIn:config.login.expireToken});

                // Get Employee Info
                var xEmployeeId = (validateEmail.employee_id != null ? ( await utilInstance.encrypt(validateEmail.employee_id.toString()) ) : 0 );
                var xUrlAPI = config.api.employeeService.getEmployeeInfo;
                var xUrlQuery = "/" + xEmployeeId;
                var xEmployeeInfo = await utilInstance.axiosRequest( ( xUrlAPI + xUrlQuery ), {} );

                return JSON.stringify({
                    "status_code": "00",
                    "status_msg": "Login successfully",
                    "token": token,
                    "user_id": (validateEmail.id != null ? ( await utilInstance.encrypt(validateEmail.id.toString()) ) : 0 ),
                    "vendor_id": (validateEmail.vendor_id != null ? ( await utilInstance.encrypt(validateEmail.vendor_id.toString()) ) : 0 ),
                    "user_type": validateEmail.type,
                    "sanqua_company_id": ( validateEmail.sanqua_company_id != null ? validateEmail.sanqua_company_id : 0 ),
                    "sanqua_company_name": ( validateEmail.sanqua_company_id != null && validateEmail.sanqua_company_id != 0 ? validateEmail.company.alias : "" ),
                    "username": validateEmail.name,
                    "employee_id": xEmployeeId,
                    "employee": ( xEmployeeInfo.data.status_code == "00" ? xEmployeeInfo.data.data : null ),
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

    async doLogin_GoogleID( param ){
        /*var validateEmail = await userRepoInstance.isEmailExists( param.email );
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
        }*/
        var urlGoogle = await googleUtilInstance.urlGoogle();
        return JSON.stringify({
            "status_code": "00",
            "status_msg": "OK",
            "url": urlGoogle
        });
    }

    async doParseQueryString_Google( param ){

        var joResult = {};
        try{

            // Get Token for access the account
            var joQuery = await utilInstance.parseQueryString(param.code);
            var joToken = await googleUtilInstance.getToken(joQuery.code);     
            
            // Get user detail using token
            var paramReq = {
                url: 'https://www.googleapis.com/oauth2/v2/userinfo',
                method: 'get',
                headers:{
                    //'Authorization': `Bearer ya29.a0AfH6SMCJ9FSMIHY3vjSVlBH9v7_g5F-yjQUcNcnxCuqZAouo0Yt-B-8PtkNPs0cNtRt3zgw56e6M4yphprh0D5u1sts9iFIOzbUOeDc_Kz1hpILAJXRcsYeSwEdyIXQIydD5sp_HdT8hDeQ6CUgn7bMOWBZKuUN3M98`,
                    'Authorization': `Bearer ` + joToken.access_token
                }
            }
            
            var joResultAccountInfo = await utilInstance.axiosRequest(config.login.oAuth2.google.urlUserInfo, paramReq); 
            var paramRegister = {
                "name": joResultAccountInfo.data.name,
                "email": joResultAccountInfo.data.email,
                "password": "",
                "method":"google",
                "google_token": joToken.access_token,
                "google_token_expire": joToken.expiry_date,
                "google_token_id": joToken.id_token
            };

            var joResultRegister = await this.doRegister(paramRegister);

            if( joResultRegister.status_code == "00" ){
                joResult = joResultRegister;
            }else{
                var joResultUpdateToken = await userRepoInstance.updateGoogleToken(joResultAccountInfo.data.email, joToken.access_token, joToken.id_token, joToken.expiry_date);
                joResult = joResultUpdateToken;
            }
            

        }catch( err ){
            joResult = {
                "status_code": "-99",
                "status_msg": "Error parse ",
                "err_msg": err.response
            }
        }
        
        return joResult;
    }  


    async doForgotPassword( param ){
        var validateEmail = await userRepoInstance.isEmailExists( param.email );
        if( validateEmail != null ){

            //Using JWT
            let token = jwt.sign({email:param.email,id:validateEmail.id,phrase:"FORGOTPASSWORD"},config.secret,{expiresIn:config.login.expireToken});
            var forgotPasswordCode = token;
            //var forgotPasswordCode = "FORGOTPASSWORD" + config.frontParam.separatorData + param.email + config.frontParam.separatorData + validateEmail.id + config.frontParam.separatorData + token;
            //forgotPasswordCode = await utilInstance.encrypt(forgotPasswordCode);
            var verificationLink = config.frontParam.forgotPasswordLink;
            verificationLink = verificationLink.replace("#VERIFICATION_CODE#", forgotPasswordCode);

            //Prepare parameter and send to notification service
            var notifyParam = {
                "email": param.email,
                "name": validateEmail.name,
                "verification_link": verificationLink

            }
            var resultNotify = await utilInstance.axiosRequestPost(config.api.notification.forgotPassword, notifyParam);

            if( resultNotify.status_code == "00" ){
                //Update status in database
                var resultUpdate = await userRepoInstance.forgotPassword(param.email);
 
                if( resultUpdate.status_code == "00" ){
                    return JSON.stringify({
                        "status_code": "00",
                        "status_msg": "OK",
                        "result_send_email_verification": resultNotify.data
                    });
                }else{
                    return JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Update status forgot password failed",
                        "result_send_email_verification": resultNotify.data
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
                    return JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Please input your new password",
                        "id": await utilInstance.encrypt(id)
                    });
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

    async doVerifyForgotPasswordCode_JWT(param){
        var response = await utilSecureInstance.verifyToken(param.code);        
        if( response.status_code == "00" ){
            var prefix = response.decoded.phrase;
            var email = response.decoded.email;
            var id = response.decoded.id;
            var verify = await userRepoInstance.verifyVerificationCode( email, id );

            if( prefix == "FORGOTPASSWORD" ){
                if( verify == null ){
                    return JSON.stringify({
                        "status_code": "-99",
                        "status_msg": "Code verification not valid"
                    });
                }else{
                    return JSON.stringify({
                        "status_code": "00",
                        "status_msg": "Please input your new password",
                        "id": await utilInstance.encrypt(id)
                    });
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
                "err_msg": response.status_msg
            });
        }
    }

    async doChangePassword( param ){

        //Verification Code first
        var result = await this.doVerifyForgotPasswordCode_JWT(param);
        if( JSON.parse(result).status_code == "00" ){

            //Decrypt id from verify code
            var rsDecrypted = await utilInstance.decrypt( JSON.parse(result).id );

            //Encrypt the new password
            var encryptedNewPassword = await utilSecureInstance.generateEncryptedPassword(param.new_password);

            //Update to database
            var resultUpdate = await userRepoInstance.changePassword(encryptedNewPassword, param.email, rsDecrypted.decrypted);
            console.log(">>> Result : " + resultUpdate.status_code);
            if( resultUpdate.status_code == "00" ){
                return JSON.stringify({
                    "status_code": "00",
                    "status_msg": "You've successfully change your password. Please relogin again"
                });
            }else{
                return JSON.stringify({
                    "status_code": "-99",
                    "status_msg": "Change password failed. Please try again or contact to our customer service.",
                    "err_msg": resultUpdate.err_msg
                });
            }
            
        }else{
            return result;
        }

    }

    async verifyToken( param ){

        var joResult = {};

        if( param.method == 'conventional' ){
            joResult = await jwtUtilInstance.verifyJWT(param.token);
        }else if( param.method == 'google' ){
            joResult = await utilInstance.axiosRequest(config.login.oAuth2.google.urlVerifyToken + param.token,{});
        }

        return JSON.stringify(joResult);

    }

    async addVendorId(param){
        
        var joResult = {}
        var flagProcess = true;

        //Decrypt id
        var xDecVendorId = await utilInstance.decrypt( param.vendor_id );
        if( xDecVendorId.status_code == "00" ){
            param.vendor_id = xDecVendorId.decrypted;
            var xDecUserId = await utilInstance.decrypt(param.user_id);
            if( xDecUserId.status_code == "00" ){
                param.user_id = xDecUserId.decrypted;
            }else{
                flagProcess = false;
                joResult = xDecUserId;
            }
        }else{
            flagProcess = false;
            joResult = xDecVendorId;
        }

        if( flagProcess )joResult = await userRepoInstance.updateVendorID( param.user_id, param.vendor_id );
        
        return JSON.stringify(joResult);
        
    }

    async deleteUser(param){
        var joResult = {}
        var flagProcess = true;

        var xDecId = await utilInstance.decrypt( param.id );
        if( xDecId.status_code == "00" ){
            param.id = xDecId.decrypted;
        }else{
            flagProcess = false;
            joResult = xDecId;
        }

        if( flagProcess ) joResult = await userRepoInstance.delete( param );

        return joResult;
    }

    async getUserByEmployeeId(pId){

        var xJoResult = {};
        var xResult = await userRepoInstance.getUserByEmployeeId( pId );

        if( xResult !== null ){
            xJoResult = {
                "status_code": "00",
                "status_msg": "OK",
                "data": xResult,
            }
        }else{
            xJoResult = {
                "status_code": "-99",
                "status_msg": "Data not found",
            }
        }

        return xJoResult;
    }

};

module.exports = UserService;