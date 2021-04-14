//Service
const ApprovalMatrixDocumentService = require('../services/approvalmatrixdocumentservice.js');
const _serviceInstance = new ApprovalMatrixDocumentService();

const ApprovalMatrixDocumentUserService = require('../services/approvalmatrixdocumentuserservice.js');
const _documentUserServiceInstance = new ApprovalMatrixDocumentUserService();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

//Validation
const { check, validationResult } = require('express-validator');

module.exports = {approvalMatrixDocument_Save, approvalMatrixDocument_List, approvalMatrixDocument_Delete, approvalMatrixDocument_IsUserAllow,
                  approvalMatrixDocumentUser_ConfirmDocument, approvalMatrixDocumentUser_ConfirmDocumentViaEmail };

// Document Type
async function approvalMatrixDocument_List( req, res ){
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

async function approvalMatrixDocument_IsUserAllow( req, res ){
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
            req.query.user_id = oAuthResult.result_verify.id;
            joResult = await _serviceInstance.isUserAllowApprove(req.query);
            joResult = JSON.stringify(joResult);
        }  
    }else{
        joResult = JSON.stringify(oAuthResult);
    }    

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function approvalMatrixDocumentUser_ConfirmDocument( req, res ){
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
            joResult = await _documentUserServiceInstance.confirmDocument(req.body);
            joResult = JSON.stringify(joResult);
        }  
    }else{
        joResult = JSON.stringify(oAuthResult);
    }    

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function approvalMatrixDocumentUser_ConfirmDocumentViaEmail( req, res ){
    var joResult;
    var errors = null;

    // Validate first
    var errors = validationResult(req).array();   
        
    if( errors.length != 0 ){
        joResult = JSON.stringify({
            "status_code": "-99",
            "status_msg":"Parameter value has problem",
            "error_msg": errors
        });
    }else{
        joResult = await _documentUserServiceInstance.confirmDocumentViaEmail(req.body);
        joResult = JSON.stringify(joResult);
    }      

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}

async function approvalMatrixDocument_Save(req, res){
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

async function approvalMatrixDocument_Delete( req, res ){
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
            joResult = await _serviceInstance.delete(req.body);
            joResult = JSON.stringify(joResult);
        }

    }else{
        joResult = JSON.stringify(oAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(joResult);
}