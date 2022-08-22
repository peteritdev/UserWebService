// Service
const OAuthService = require('../services/oauth2service.js');
const _oAuthService = new OAuthService();

const { check, validationResult } = require('express-validator');

module.exports = { doLogin, token, tokenInfo };

async function doLogin(req, res) {
	var xJoResult = {};

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		xJoResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		xJoResult = await _oAuthService.doLogin(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function token(req, res) {
	var xJoResult = {};

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		xJoResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		xJoResult = await _oAuthService.token(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function tokenInfo(req, res) {
	var xJoResult = {};

	// Validate first
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		xJoResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter has problem',
			error_msg: errors
		});
	} else {
		xJoResult = await _oAuthService.tokenInfo(req.query);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}
