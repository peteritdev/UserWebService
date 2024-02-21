// Service
const OAuthService = require('../services/oauth2service.js');
const _oAuthService = new OAuthService();

const ClientApplicationService = require('../services/clientapplicationservice.js');
const _clientApplicationService = new ClientApplicationService();

const { check, validationResult } = require('express-validator');

module.exports = { doLogin, token, tokenInfo, tokenProfile, checkClientCredential, accessTokenBCA };

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

	console.log(`>>> joResult: ${JSON.stringify(joResult)}`);

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

async function accessTokenBCA(req, res) {
	var xJoResult = {};
	var xHttpCode = 200;

	// Validate Header
	var errors = validationResult(req).array();
	if (errors.length != 0) {
		xHttpCode = 400;
		xJoResult = JSON.stringify({
			responseCode: '4007302',
			responseMessage: errors[0].msg
		});
	} else {
		// Verify signature
		let xParamVerify = {
			signature: req.headers['x-signature'],
			client_id: req.headers['x-clientkey'],
			time_stamp: req.headers['x-timestamp']
		};
		let xIsVerified = await _oAuthService.verifyBCASignature(xParamVerify);
		if (xIsVerified.is_verified) {
			xJoResult = await _oAuthService.token({
				client_id: req.headers['x-clientkey'],
				grant_type: req.body.grantType
			});
			if (xJoResult.status_code == '00') {
				xHttpCode = 200;
				xJoResult = {
					responseCode: `${xHttpCode}7300`,
					responseMessage: 'Successfull',
					accessToken: xJoResult.access_token,
					tokenType: xJoResult.token_type,
					expiresIn: xJoResult.expires_in
				};
			}
		} else {
			xHttpCode = 401;
			xJoResult = {
				responseCode: `${xHttpCode}7300`,
				responseMessage: 'Unauthorize.[Signature]'
			};
		}

		//xJoResult = await _oAuthService.token(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(xHttpCode).send(xJoResult);
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
		xJoResult = await _oAuthService.verifyTokenOAuth2(req.headers);
	}

	console.log(`>>> req.headers <tokenInfo> : ${JSON.stringify(req.headers)}`);
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
