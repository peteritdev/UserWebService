// User Service
const NotificationService = require('../services/notificationservice.js');
const _serviceInstance = new NotificationService();

// Test Service
const TestService = require('../services/testservice.js');
const _testService = new TestService();

// Validation Parameter
const { check, validationResult } = require('express-validator');

module.exports = {
	testSendNewRegister,
	generateBCASignature,
	verifyBCASignature
};

async function verifyBCASignature(req, res) {
	let xJoResult = await _testService.verifyBCASignature(req.body);
	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function generateBCASignature(req, res) {
	// req.body.time_stamp = req.headers['X-TIMESTAMP'];
	// req.body.client_id = req.headers['X-CLIENTKEY'];
	let xJoResult = await _testService.generateBCASignature(req.body);
	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(xJoResult);
}

async function testSendNewRegister(req, res) {
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
		joResult = await _serviceInstance.sendNotification_NewEmployeeRegister(req.body);
	}

	res.setHeader('Content-Type', 'application/json');
	res.status(200).send(joResult);
}
