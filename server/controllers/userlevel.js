var config = require('../config/config.json');

// Risk Category Service
const UserLevelService = require('../services/userlevelservice.js');
const _userLevelServiceInstance = new UserLevelService();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

const { check, validationResult } = require('express-validator');

module.exports = { save, list, dropDownList, deleteUserLevel, getById }

async function getById( req, res ){
    var xJoResult = {};
    var xOAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    xOAuthResult = JSON.parse(xOAuthResult);
    
    if( xOAuthResult.status_code == "00" ){
        // if( xOAuthResult.data.status_code == "00" ){
            // Validate first
            var xError = validationResult(req).array();               
            if( xError.length != 0 ){
                xJoResult = JSON.stringify({
                    "status_code": "-99",
                    "status_msg":"Parameter value has problem",
                    "error_msg": xError
                });
            }else{
                
                xJoResult = await _userLevelServiceInstance.getById(req.params);
                xJoResult = JSON.stringify(xJoResult);
                console.log(xJoResult);
            }
        // }else{
        //     xJoResult = JSON.stringify(xOAuthResult);
        // }
    }else{
        xJoResult = JSON.stringify(xOAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(xJoResult);

    return xJoResult;
}

async function save(req,res){
    var xJoResult = {};
    var xOAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );

    xOAuthResult = JSON.parse(xOAuthResult);

    if( xOAuthResult.status_code == "00" ){
        // if( xOAuthResult.data.status_code == "00" ){
            // Validate first
            var xError = validationResult(req).array();               
            if( xError.length != 0 ){
                xJoResult = JSON.stringify({
                    "status_code": "-99",
                    "status_msg":"Parameter value has problem",
                    "error_msg": xError
                });
            }else{
                
                req.body.user_id = xOAuthResult.result_verify.id;
                req.params.user_name = xOAuthResult.result_verify.name;
                xJoResult = await _userLevelServiceInstance.save(req.body);
                xJoResult = JSON.stringify(xJoResult);
                console.log(xJoResult);
            }
        // }else{
        //     xJoResult = JSON.stringify(xOAuthResult);
        // }
    }else{
        xJoResult = JSON.stringify(xOAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(xJoResult);

    return xJoResult;
}

async function list(req,res){
    var xJoResult = {};
    var xOAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    xOAuthResult = JSON.parse(xOAuthResult);

    if( xOAuthResult.status_code == "00" ){
        // if( xOAuthResult.data.status_code == "00" ){
            // Validate first
            var xError = validationResult(req).array();               
            if( xError.length != 0 ){
                xJoResult = JSON.stringify({
                    "status_code": "-99",
                    "status_msg":"Parameter value has problem",
                    "error_msg": xError
                });
            }else{
                
                req.body.user_id = xOAuthResult.result_verify.id;
                req.params.user_name = xOAuthResult.result_verify.name;
                xJoResult = await _userLevelServiceInstance.list(req.query);
                xJoResult = JSON.stringify(xJoResult);
                console.log(xJoResult);
            }
        // }else{
        //     xJoResult = JSON.stringify(xOAuthResult);
        // }
    }else{
        xJoResult = JSON.stringify(xOAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(xJoResult);

    return xJoResult;
}

async function deleteUserLevel(req,res){
    var xJoResult = {};
    var xOAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    xOAuthResult = JSON.parse(xOAuthResult);

    if( xOAuthResult.status_code == "00" ){
        // if( xOAuthResult.data.status_code == "00" ){
            // Validate first
            var xError = validationResult(req).array();               
            if( xError.length != 0 ){
                xJoResult = JSON.stringify({
                    "status_code": "-99",
                    "status_msg":"Parameter value has problem",
                    "error_msg": xError
                });
            }else{
                req.params.user_id = xOAuthResult.result_verify.id;
                req.params.user_name = xOAuthResult.result_verify.name;
                xJoResult = await _userLevelServiceInstance.delete(req.params);
                xJoResult = JSON.stringify(xJoResult);
                console.log(xJoResult);
            }
        // }else{
        //     xJoResult = JSON.stringify(xOAuthResult);
        // }
    }else{
        xJoResult = JSON.stringify(xOAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(xJoResult);

    return xJoResult;
}

async function dropDownList(req,res){
    var xJoResult = {};
    var xOAuthResult = await _oAuthServiceInstance.verifyToken( { token: req.headers['x-token'], method: req.headers['x-method'] } );
    xOAuthResult = JSON.parse(xOAuthResult);

    if( xOAuthResult.status_code == "00" ){
        // if( xOAuthResult.data.status_code == "00" ){
            // Validate first
            var xError = validationResult(req).array();               
            if( xError.length != 0 ){
                xJoResult = JSON.stringify({
                    "status_code": "-99",
                    "status_msg":"Parameter value has problem",
                    "error_msg": xError
                });
            }else{
                
                req.body.user_id = xOAuthResult.result_verify.id;
                xJoResult = await _userLevelServiceInstance.dropDownList(req.query);
                xJoResult = JSON.stringify(xJoResult);
                console.log(xJoResult);
            }
        // }else{
        //     xJoResult = JSON.stringify(xOAuthResult);
        // }
    }else{
        xJoResult = JSON.stringify(xOAuthResult);
    }

    res.setHeader('Content-Type','application/json');
    res.status(200).send(xJoResult);

    return xJoResult;
}