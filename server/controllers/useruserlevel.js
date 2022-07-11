//Service
const UserUserLevelService = require('../services/useruserlevelservice.js');
const _serviceInstance = new UserUserLevelService();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

//Validation
const { check, validationResult } = require('express-validator');

module.exports = {
	userUserLevel_Save,
	userUserLevel_List,
	userUserLevel_Delete,
	userUserLevel_GetById,
	userUserLevel_BatchAssignApplicaation
};

async function userUserLevel_List(req, res) {
	var joResult;
	var errors = null;

	var xOAuthResult = await _oAuthServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	xOAuthResult = JSON.parse(xOAuthResult);

	if (xOAuthResult.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			joResult = await _serviceInstance.list(req.query);
			joResult.token_data = xOAuthResult.token_data;
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = JSON.stringify(xOAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function userUserLevel_GetById(req, res) {
	var joResult;
	var errors = null;

	var xOAuthResult = await _oAuthServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	xOAuthResult = JSON.parse(xOAuthResult);

	if (xOAuthResult.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			joResult = await _serviceInstance.getById(req.params);
			joResult.token_data = xOAuthResult.token_data;
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = JSON.stringify(xOAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function userUserLevel_Save(req, res) {
	var joResult;
	var errors = null;

	var xOAuthResult = await _oAuthServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	xOAuthResult = JSON.parse(xOAuthResult);

	console.log(JSON.stringify(xOAuthResult));

	if (xOAuthResult.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			req.body.user_id = xOAuthResult.result_verify.id;
			req.body.user_name = xOAuthResult.result_verify.name;
			joResult = await _serviceInstance.save(req.body);
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = JSON.stringify(xOAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function userUserLevel_Delete(req, res) {
	var joResult;
	var errors = null;

	var xOAuthResult = await _oAuthServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	xOAuthResult = JSON.parse(xOAuthResult);

	if (xOAuthResult.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			req.params.user_id = xOAuthResult.result_verify.id;
			req.params.user_name = xOAuthResult.result_verify.name;
			joResult = await _serviceInstance.delete(req.params);
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = JSON.stringify(xOAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}

async function userUserLevel_BatchAssignApplicaation(req, res) {
	var joResult;
	var errors = null;

	var xOAuthResult = await _oAuthServiceInstance.verifyToken({
		token: req.headers['x-token'],
		method: req.headers['x-method']
	});
	xOAuthResult = JSON.parse(xOAuthResult);

	console.log(JSON.stringify(xOAuthResult));

	if (xOAuthResult.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			joResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			req.body.user_id = xOAuthResult.result_verify.id;
			req.body.user_name = xOAuthResult.result_verify.name;
			joResult = await _serviceInstance.batchAssignApplication(req.body);
			joResult = JSON.stringify(joResult);
		}
	} else {
		joResult = JSON.stringify(xOAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}
