// Service
const Service = require('../services/thirdpartyuserservice.js');
const _serviceInstance = new Service();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

// Validation Parameter
const { check, validationResult } = require('express-validator');

module.exports = { save, getToken, refreshToken, verifyToken };

async function save(req, res) {
	var joResult;
	var errors = null;

	var oAuthResult = await _oAuthServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	oAuthResult = JSON.parse(oAuthResult);

	if (oAuthResult.status_code == '00') {
		//Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			req.body.user_id = oAuthResult.result_verify.id;
			joResult = await _serviceInstance.save(req.body);
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = JSON.stringify(oAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function getToken(req, res) {
	var joResult;
	var errors = null;

	//Validate first
	var errors = validationResult(req).array();

	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		req.body.authorization = req.headers['authorization'];
		joResult = await _serviceInstance.getToken(req.body);
		joResult = JSON.stringify(joResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function refreshToken(req, res) {
	var joResult;
	var errors = null;

	var errors = validationResult(req).array();

	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		req.body.authorization = req.headers['authorization'];
		joResult = await _serviceInstance.refreshToken(req.body);
		joResult = JSON.stringify(joResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function verifyToken(req, res) {
	var joResult;
	var errors = null;

	var errors = validationResult(req).array();

	if (errors.length != 0) {
		joResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		req.body.authorization = req.headers['authorization'];
		joResult = await _serviceInstance.verifyAccessToken(req.body);
		joResult = JSON.stringify(joResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}
