const jwt = require('jsonwebtoken');
const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const sequelize = require('sequelize');
const dateFormat = require('dateformat');
const Op = sequelize.Op;
const bcrypt = require('bcrypt');
const fs = require('fs');

const env         = process.env.NODE_ENV || 'development';
const config      = require(__dirname + '/../config/config.json')[env];

//Repository
const UserUserLevelRepository = require('../repository/useruserlevelrepository.js');
const _repoInstance = new UserUserLevelRepository();
const UserRepository = require('../repository/userrepository.js');
const _userRepoInstance = new UserRepository();

//Util
const Utility = require('peters-globallib');
const _utilInstance = new Utility();

class UserUserLevelService {
    constructor(){}   

    async list(pParam){
        var xJoResult = {};
        var xJoArrData = [];
        var xFlagProcess = true;

        if( pParam.hasOwnProperty('employee_user_id') ){
            if( pParam.employee_user_id != '' ){
                console.log(">>> HERE");
                var xDecId = await _utilInstance.decrypt( pParam.employee_user_id, config.cryptoKey.hashKey );
                if( xDecId.status_code == '00' ){
                    pParam.employee_user_id = xDecId.decrypted;
                }else{
                    xFlagProcess = false;
                    xJoResult = xDecId;
                }
            }
        }        

        if( pParam.hasOwnProperty('employee_id') ){
            if( pParam.employee_id != '' ){
                var xDecId = await _utilInstance.decrypt( pParam.employee_id, config.cryptoKey.hashKey );
                console.log(JSON.stringify(xDecId));
                if( xDecId.status_code == '00' ){
                    pParam.employee_id = xDecId.decrypted;
                }else{
                    xFlagProcess = false;
                    xJoResult = xDecId;
                }
            }
        }   
        
        
        if( xFlagProcess ){
            var xResultList = await _repoInstance.list(pParam);
            if( xResultList.count > 0 ){
                var xRows = xResultList.rows;
                for( var index in xRows ){
                    xJoArrData.push({
                        id: await _utilInstance.encrypt( (xRows[index].id).toString(), config.cryptoKey.hashKey ),
                        application_id: ( xRows[index].user_level.application_id != null ? parseInt(xRows[index].user_level.application_id) : null ),
                        user_level_id: ( xRows[index].user_level != null ? parseInt(xRows[index].user_level.id) : null ),
                    });
                }
                xJoResult = {
                    status_code: "00",
                    status_msg: "OK",
                    data: xJoArrData,
                    total_record: xResultList.count,
                }
            }else{
                xJoResult = {
                    status_code: "-99",
                    status_msg: "Data not found",
                };
            }
        }         

        return xJoResult;
    }

    async getById( pParam ){
        var xJoResult = {};
        var xFlagProcess = true;

        if( pParam.id != '' ){
            var xDecId = await _utilInstance.decrypt( pParam.id, config.cryptoKey.hashKey );
            if( xDecId.status_code == '00' ){
                pParam.id = xDecId.decrypted;
            }else{
                xFlagProcess = false;
                xJoResult = xDecId;
            }
            if( xFlagProcess ){
                var xResult = await _repoInstance.getById( pParam );
                if( xResult != null ){
                    xJoResult = {
                        status_code: '00',
                        status_msg: 'OK',
                        data: xResult
                    }
                }else{
                    xJoResult = {
                        status_code: "-99",
                        status_msg: "Data not found",
                    };
                }
            }
        }else{
            xJoResult = {
                status_code: '-99',
                status_msg: 'Parameter not valid'
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

            // User Id
            var xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
            if( xDecId.status_code == '00' ){
                pParam.created_by = xDecId.decrypted;
                pParam.created_by_name = pParam.user_name;                
            
                if( pParam.hasOwnProperty('employee_user_id') ){
                    if( pParam.employee_user_id != '' ){
                        // employee_user_id
                        xDecId = await _utilInstance.decrypt(pParam.employee_user_id, config.cryptoKey.hashKey);
                        if( xDecId.status_code == '00' ){
                            pParam.user_id = xDecId.decrypted;
                            delete pParam.employee_user_id;
                        }else{
                            xFlagProcess = false;
                            xJoResult = xDecId;
                        }
                    }
                }

                if( pParam.hasOwnProperty('employee_id') ){
                    if( pParam.employee_user_id != '' ){
                        // employee_id
                        xDecId = await _utilInstance.decrypt(pParam.employee_id, config.cryptoKey.hashKey);
                        if( xDecId.status_code == '00' ){
                            // Get User ID by employee_id
                            var xUserData = await _userRepoInstance.getUserByEmployeeId( xDecId.decrypted );
                            pParam.user_id = xUserData.id;
                            delete pParam.employee_id;
                        }else{
                            xFlagProcess = false;
                            xJoResult = xDecId;
                        }
                    }
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

            console.log(JSON.stringify(pParam));

            var xDecId = await _utilInstance.decrypt(pParam.id, config.cryptoKey.hashKey);
            if( xDecId.status_code == "00" ){
                pParam.id = xDecId.decrypted;                    
                xDecId = await _utilInstance.decrypt(pParam.user_id, config.cryptoKey.hashKey);
                if( xDecId.status_code == "00" ){
                    pParam.updated_by = xDecId.decrypted;
                    pParam.updated_by_name = pParam.user_name;

                    // employee_user_id
                    xDecId = await _utilInstance.decrypt(pParam.employee_user_id, config.cryptoKey.hashKey);
                    if( xDecId.status_code == '00' ){
                        pParam.user_id = xDecId.decrypted;
                        delete pParam.employee_user_id;
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

        if( xFlagProcess ){        
            var xDeleteResult = await _repoInstance.delete( pParam );
            xJoResult = xDeleteResult;
        }

        return xJoResult;
    }   

    async uploadFromExcel( pReq, pRes ){
        var xExcelToJSON;
        upload( pReq, pRes, function( pErr ){
            if( pErr ){
                var joResult =  {
                    "status_code": "-99",
                    "status_msg": "",
                    "err_msg": pErr
                }

                try {
                    fs.unlinkSync(pReq.file.path);
                } catch(e) {
                    //error deleting the file
                    console.log(e);
                }
                
                pRes.setHeader('Content-Type','application/json');
                pRes.status(200).send(joResult);
            }

            console.log(pReq.file)

            if( !pReq.file ){
                var joResult = {
                    "status_code": "-99",
                    "status_msg": "",
                    "err_msg": "No file passed"
                }

                try {
                    fs.unlinkSync(pReq.file.path);
                } catch(e) {
                    //error deleting the file
                    console.log(e);
                }

                pRes.setHeader('Content-Type','application/json');
                pRes.status(200).send(joResult);
            }

            //start convert process
            /** Check the extension of the incoming file and
             *  use the appropriate module
             */
            if(pReq.file.originalname.split('.')[pReq.file.originalname.split('.').length-1] === 'xlsx'){
                xExcelToJSON = _xlsxToJson;
            } else {
                xExcelToJSON = _xlsToJson;
            }

            try {
                xExcelToJSON({
                    input: pReq.file.path, //the same path where we uploaded our file
                    output: null, //since we don't need output.json
                    lowerCaseHeaders:true
                }, function(err,result){
                    if(err) {
                        var joResult = {
                            "status_code": "-99",
                            "status_msg": "",
                            "err_msg": err
                        }

                        try {
                            fs.unlinkSync(pReq.file.path);
                        } catch(e) {
                            //error deleting the file
                            console.log(e);
                        }

                        pRes.setHeader('Content-Type','application/json');
                        pRes.status(200).send(joResult);
                    }
                    var joResult = {
                        "status_code": "00",
                        "status_msg": "OK",
                        "data": result,
                        "err_msg": null
                    }

                    try {
                        fs.unlinkSync(pReq.file.path);
                    } catch(e) {
                        //error deleting the file
                        console.log(e);
                    }

                    console.log(joResult);

                    pRes.setHeader('Content-Type','application/json');
                    pRes.status(200).send(joResult);
                });
            } catch (e){
                var joResult = {
                    "status_code": "-99",
                    "status_msg": "",
                    "err_msg": "Corupted excel file"
                }

                try {
                    fs.unlinkSync(pReq.file.path);
                } catch(e) {
                    //error deleting the file
                    console.log(e);
                }

                pRes.setHeader('Content-Type','application/json');
                pRes.status(200).send(joResult);
            }

        } );
    }

    async batchSave( pParam ){
        
        var joResult;
        var jaResult = [];
        var jaDuplicateResult = [];

        console.log(">>> Length : " + pParam.data.length);

        if( pParam.act == "add" ){
            for( var i = 0; i < pParam.data.length; i++ ){

                pParam.data[i].spesification_category_id = parseInt(pParam.data[i].spesification_category_id);

                if( pParam.data[i].hasOwnProperty('id') ){
                    if( pParam.data[i].id != '' ){
                        pParam.data[i].act = "update";
                        var xAddResult = await _repoInstance.save( pParam.data[i], "update" );
                    }         
                }else{
                    var xAddResult = await _repoInstance.save( pParam.data[i], pParam.act );
                }   

            }

            // await _utilInstance.changeSequenceTable((pParam.data.length)+1, 'ms_units','id');

            joResult = {
                "status_code": "00",
                "status_msg": "Finish save to database",
            }
        }else if( pParam.act == "update" ){
            

        }

        return joResult;

    }

}

module.exports = UserUserLevelService;
