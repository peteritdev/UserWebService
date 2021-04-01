//Service
const ApplicationTableService = require('../services/applicationtableservice.js');
const _serviceInstance = new ApplicationTableService();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

//Validation
const { check, validationResult } = require('express-validator');

module.exports = {applicationTable_Save, applicationTable_List, applicationTable_Delete, applicationTable_DropDown};

// Document Type
async function applicationTable_List( req, res ){
    var joResult;
    var errors = null;

    var oAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    oAuthResult = JSON.parse(oAuthResult);

    if( oAuthResult.status_code == "00" ){
        // Validate first
        var errors = validationResult(req).array();   
        
        if( errors.length != 0 ){
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg":"Parameter value has problem",
                "error_msg": errors
            });
        }else{                      
            joResult = await _serviceInstance.list(req.query);
            joResult = JSON.stringify(joResult);
        }  
    }else{
        joResult = JSON.stringify(oAuthResult);
    }    

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function applicationTable_DropDown( req, res ){
    var joResult;
    var errors = null;

    var oAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    oAuthResult = JSON.parse(oAuthResult);

    if( oAuthResult.status_code == "00" ){
        // Validate first
        var errors = validationResult(req).array();   
        
        if( errors.length != 0 ){
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg":"Parameter value has problem",
                "error_msg": errors
            });
        }else{                      
            joResult = await _serviceInstance.dropDownList(req.query);
            joResult = JSON.stringify(joResult);
        }
    }else{
        joResult = JSON.stringify(oAuthResult);
    }    

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function applicationTable_Save(req, res){
    var joResult;
    var errors = null;

    var oAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    oAuthResult = JSON.parse(oAuthResult); 

    if( oAuthResult.status_code == "00" ){

        // Validate first
        var errors = validationResult(req).array();   
        
        if( errors.length != 0 ){
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg":"Parameter value has problem",
                "error_msg": errors
            });
        }else{      
            
            req.body.user_id = oAuthResult.result_verify.id;
            req.body.user_name = oAuthResult.result_verify.name;
            joResult = await _serviceInstance.save(req.body);
            joResult = JSON.stringify(joResult);
        }

    }else{
        joResult = JSON.stringify(oAuthResult);
    }  

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function applicationTable_Delete( req, res ){
    var joResult;
    var errors = null;

    var oAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    oAuthResult = JSON.parse(oAuthResult);

    if( oAuthResult.status_code == "00" ){

        // Validate first
        var errors = validationResult(req).array();   
        
        if( errors.length != 0 ){
            joResult = JSON.stringify({
                "status_code": "-99",
                "status_msg":"Parameter value has problem",
                "error_msg": errors
            });
        }else{      
            req.params.user_id = oAuthResult.result_verify.id;
            req.params.user_name = oAuthResult.result_verify.name;
            joResult = await _serviceInstance.delete(req.params);
            joResult = JSON.stringify(joResult);
        }

    }else{
        joResult = JSON.stringify(oAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}