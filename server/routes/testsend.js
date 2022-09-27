const _testController = require('../controllers').test;

const { check, validationResult } = require('express-validator');

var rootAPIPath = '/api/oauth/v1/test/';

module.exports = (app) => {
	app.get(rootAPIPath, (req, res) =>
		res.status(200).send({
			message: 'Welcome to the Todos API!'
		})
	);

	app.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
		res.header(
			'Access-Control-Allow-Headers',
			'Origin, X-Requested-With, Content-Type, Accept, x-method, x-token, x-application-id'
		);
		next();
	});

	app.post(rootAPIPath + 'send_notif_after_register', _testController.testSendNewRegister);
};
