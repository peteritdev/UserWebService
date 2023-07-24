// Service
const OAuthService = require('../services/oauth2service.js');
const _oAuthService = new OAuthService();

const ClientApplicationService = require('../services/clientapplicationservice.js');
const _clientApplicationService = new ClientApplicationService();

const { check, validationResult } = require('express-validator');

module.exports = { doLogin, token, tokenInfo, tokenProfile, checkClientCredential };

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

	console.log(`>>> xJoResult <token> : ${JSON.stringify(xJoResult)}`);

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

	console.log(`>>> req.query <tokenInfo> : ${JSON.stringify(req.query)}`);
	console.log(`>>> xJoResult <tokenInfo> : ${JSON.stringify(xJoResult)}`);

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function tokenProfile(req, res) {
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
		xJoResult = await _oAuthService.tokenProfile(req.query);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function checkClientCredential(req, res) {
	var xJoResult;
	// Validate first
	var errors = validationResult(req).array();

	if (errors.length != 0) {
		xJoResult = JSON.stringify({
			status_code: '-99',
			status_msg: 'Parameter value has problem',
			error_msg: errors
		});
	} else {
		xJoResult = await _clientApplicationService.checkClientCredential(req.body);
		xJoResult = JSON.stringify(xJoResult);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}
