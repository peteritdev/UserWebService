// User Service
const UserService = require('../services/userservice.js');
const userServiceInstance = new UserService();
// User Validation
const UserValidation = require('../utils/validation/uservalidation.js');
const userValidationInstance = new UserValidation();

//Library
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Validation Parameter
const { check, validationResult } = require('express-validator');

module.exports = {
	list,
	dropDownList,
	save,
	deleteUser,
	register,
	generatePassword,
	verifyAccount,
	login,
	forgotPassword,
	verifyForgotPassword,
	changePassword,
	loggedChangePassword,
	loginGoogle,
	parseQueryGoogle,
	verifyToken,
	addVendorId,
	getUserByEmployeeId,
	updateFCMToken
};

async function list(req, res) {
	var joResult;
	var errors = null;

	/*var oAuthResult = await userServiceInstance.verifyToken({
                                                                token: req.headers['x-token'],
                                                                method: req.headers['x-method']
                                                            });
    if( JSON.parse(oAuthResult).status_code == "00" ){
        joResult = await userServiceInstance.list(req.query);        
            joResult.token_data = oAuthResult.token_data;
            joResult = JSON.stringify(joResult);
    }else{
        joResult = (oAuthResult);
    }    */

	joResult = await userServiceInstance.list(req.query);
	//joResult.token_data = oAuthResult.token_data;
	joResult = JSON.stringify(joResult);

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function dropDownList(req, res) {
	var joResult;
	var errors = null;

	/*var oAuthResult = await userServiceInstance.verifyToken({
                                                                token: req.headers['x-token'],
                                                                method: req.headers['x-method']
                                                            });
    if( JSON.parse(oAuthResult).status_code == "00" ){
        joResult = await userServiceInstance.list(req.query);        
            joResult.token_data = oAuthResult.token_data;
            joResult = JSON.stringify(joResult);
    }else{
        joResult = (oAuthResult);
    }    */

	joResult = await userServiceInstance.dropDownList(req.query);
	//joResult.token_data = oAuthResult.token_data;
	joResult = JSON.stringify(joResult);

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function register(req, res) {
	var joResult;

	console.log(JSON.stringify(req.body));

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.doRegister(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function save(req, res) {
	var joResult;
	var errors = null;

	// No need authenticate first
	// var oAuthResult = await userServiceInstance.verifyToken({
	//     token: req.headers['x-token'],
	//     method: req.headers['x-method']
	// });

	// if( JSON.parse(oAuthResult).status_code == "00" ){

	// }else{
	//     joResult = (oAuthResult);
	// }

	//Validate first
	var errors = validationResult(req).array();

	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		//req.body.user_id = JSON.parse(oAuthResult).result_verify.id;
		console.log('>>> Body : ' + JSON.stringify(req.body));
		joResult = await userServiceInstance.save(req.body);
		joResult = JSON.stringify(joResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function deleteUser(req, res) {
	var joResult;
	var errors = null;

	var oAuthResult = await userServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});

	if (JSON.parse(oAuthResult).status_code == '00') {
		//Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			joResult = await userServiceInstance.deleteUser(req.params);
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = oAuthResult;
	}

	console.log(req.body);

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function generatePassword(req, res) {
	var joResult;

	//var encPassword = md5( req.body.password + config.md5Key );
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(req.body.password, salt, function(err, hash) {
			joResult = JSON.stringify({
				status_code: '00',
				status_msg: 'User successfully created',
				password: hash
			});
			res.setHeader('Content-Type', 'application/json');
			res.status(200).send(joResult);
		});
	});
}

async function verifyAccount(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.doVerifyAccount(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function login(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		req.body.application_id = req.headers['x-application-id'];
		joResult = await userServiceInstance.doLogin(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function loginGoogle(req, res) {
	var joResult;

	joResult = await userServiceInstance.doLogin_GoogleID(req.body);

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function parseQueryGoogle(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.doParseQueryString_Google(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function forgotPassword(req, res) {
	var joResult;
	var xUserId = '';

	// Get logged user if this api hit from backoffice
	var oAuthResult = await userServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});

	oAuthResult = JSON.parse(oAuthResult);
	console.log(`>>> oAuthResult: ${JSON.stringify(oAuthResult)}`);

	if (oAuthResult.status_code == '00') {
		req.body.user_id = oAuthResult.result_verify.id;
	}

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.doForgotPasswordWithGenerateNew(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function verifyForgotPassword(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.doVerifyForgotPasswordCode_JWT(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function changePassword(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.doChangePassword(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function loggedChangePassword(req, res) {
	var joResult;

	var oAuthResult = await userServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});

	oAuthResult = JSON.parse(oAuthResult);

	if (oAuthResult.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();
		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter has problem',
				error_msg: errors
			});
		} else {
			req.body.email = oAuthResult.result_verify.email;
			req.body.user_id = oAuthResult.result_verify.id;
			req.body.user_name = oAuthResult.result_verify.name;
			joResult = await userServiceInstance.doLoggedChangePassword(req.body);
		}
	} else {
		joResult = oAuthResult;
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function verifyToken(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		if (req.query.token != '' && req.query.method != '') {
			joResult = await userServiceInstance.verifyToken({
				token: req.query.token,
				method: req.query.method
			});
		} else {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Invalid parameter token and method'
			});
		}
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function addVendorId(req, res) {
	var joResult;

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		joResult = await userServiceInstance.addVendorId(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function getUserByEmployeeId(req, res) {
	var joResult;
	var errors = null;

	var oAuthResult = await userServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	if (JSON.parse(oAuthResult).status_code == '00') {
		joResult = await userServiceInstance.getUserByEmployeeId(req.params.employeeId);
		joResult = JSON.stringify(joResult);
	} else {
		joResult = oAuthResult;
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function updateFCMToken(req, res) {
	var xJoResult;
	var errors = null;

	var xOAuthResult = await userServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});

	xOAuthResult = JSON.parse(xOAuthResult);
	console.log(`>>> OAuth Result : ${JSON.stringify(xOAuthResult)}`);

	if (xOAuthResult.status_code == '00') {
		req.body.user_id = xOAuthResult.result_verify.id;
		console.log(`>>> Body : ${JSON.stringify(req.body)}`);
		xJoResult = await userServiceInstance.doUpdateFCMToken(req.body);
		xJoResult = JSON.stringify(xJoResult);
	} else {
		xJoResult = xOAuthResult;
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}
