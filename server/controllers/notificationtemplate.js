//Service
const NotificationTemplateService = require('../services/notificationtemplateservice.js');
const _serviceInstance = new NotificationTemplateService();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

//Validation
const { check, validationResult } = require('express-validator');

module.exports = {notificationTemplate_Save, notificationTemplate_List, notificationTemplate_Delete, notificationTemplate_GetById, notificationTemplate_GetByCode};

// Document Type
async function notificationTemplate_List( req, res ){
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

async function notificationTemplate_GetById( req, res ){
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
            joResult = await _serviceInstance.getById(req.params);
            joResult = JSON.stringify(joResult);
        }
    }else{
        joResult = JSON.stringify(oAuthResult);
    }    

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function notificationTemplate_GetByCode( req, res ){
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
            joResult = await _serviceInstance.getByCode(req.params);
            joResult = JSON.stringify(joResult);
        }
    }else{
        joResult = JSON.stringify(oAuthResult);
    }    

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function notificationTemplate_Save(req, res){
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

async function notificationTemplate_Delete( req, res ){
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