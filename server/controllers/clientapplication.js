// Services
const Service = require('../services/clientapplicationservice.js');
const _serviceInstance = new Service();

// OAuth Service
const OAuthService = require('../services/userservice.js');
const _oAuthServiceInstance = new OAuthService();

// Validation
const { check, validationResult } = require('express-validator');

module.exports = { save, list, deletePermanent, detail };

async function save(req, res) {
	var xJoResult;
	var xOAuthResult = await _oAuthServiceInstance.verifyToken({
		method: req.headers['x-method'],
		token: req.headers['x-token']
	});

	// console.log(xOAuthResult);

	xOAuthResult = JSON.parse(xOAuthResult);

	if (xOAuthResult.status_code == '00') {
		// if (xOAuthResult.token_data.status_code == '00') {
		// Validate first
		var errors = validationResult(req).array();

		if (errors.length != 0) {
			xJoResult = JSON.stringify({
				status_code: '-99',
				status_msg: 'Parameter value has problem',
				error_msg: errors
			});
		} else {
			req.body.logged_user_id = xOAuthResult.result_verify.id;
			req.body.logged_user_name = xOAuthResult.result_verify.name;
			xJoResult = await _serviceInstance.save(req.body);
			xJoResult = JSON.stringify(xJoResult);
		}
	} else {
		xJoResult = xOAuthResult;
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function list(req, res) {
	var xJoResult;
	var xOAuthResult = await _oAuthServiceInstance.verifyToken(req.headers['x-token'], req.headers['x-method']);

	if (xOAuthResult.status_code == '00') {
		if (xOAuthResult.token_data.status_code == '00') {
			// Validate first
			var errors = validationResult(req).array();

			if (errors.length != 0) {
				xJoResult = JSON.stringify({
					status_code: '-99',
					status_msg: 'Parameter value has problem',
					error_msg: errors
				});
			} else {
				xJoResult = await _serviceInstance.list(req.query);
				xJoResult = JSON.stringify(xJoResult);
			}
		} else {
			xJoResult = JSON.stringify(xOAuthResult);
		}
	} else {
		xJoResult = JSON.stringify(oAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function detail(req, res) {
	var xJoResult;
	var xOAuthResult = await _oAuthServiceInstance.verifyToken(req.headers['x-token'], req.headers['x-method']);

	if (xOAuthResult.status_code == '00') {
		if (xOAuthResult.token_data.status_code == '00') {
			// Validate first
			var errors = validationResult(req).array();

			if (errors.length != 0) {
				xJoResult = JSON.stringify({
					status_code: '-99',
					status_msg: 'Parameter value has problem',
					error_msg: errors
				});
			} else {
				xJoResult = await _serviceInstance.detail(req.params);
				xJoResult = JSON.stringify(xJoResult);
			}
		} else {
			xJoResult = JSON.stringify(xOAuthResult);
		}
	} else {
		xJoResult = JSON.stringify(oAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function deletePermanent(req, res) {
	var xJoResult;
	var xOAuthResult = await _oAuthServiceInstance.verifyToken(req.headers['x-token'], req.headers['x-method']);

	if (xOAuthResult.status_code == '00') {
		if (xOAuthResult.token_data.status_code == '00') {
			// Validate first
			var errors = validationResult(req).array();

			if (errors.length != 0) {
				xJoResult = JSON.stringify({
					status_code: '-99',
					status_msg: 'Parameter value has problem',
					error_msg: errors
				});
			} else {
				req.params.logged_user_level = xOAuthResult.token_data.result_verify.user_level;
				req.params.logged_user_id = xOAuthResult.token_data.result_verify.id;
				req.params.logged_user_name = xOAuthResult.token_data.result_verify.name;
				xJoResult = await _serviceInstance.delete(req.params);
				xJoResult = JSON.stringify(xJoResult);
			}
		} else {
			xJoResult = JSON.stringify(xOAuthResult);
		}
	} else {
		xJoResult = JSON.stringify(oAuthResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}
