const _thirdPartyUser = require('../controllers').thirdPartyUser;

const { check, validationResult } = require('express-validator');

var _rootAPIPath = '/simpeg/oauth/v1/third_party_user/';

module.exports = (app) => {
	app.get(_rootAPIPath, (req, res) =>
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

	var xArrValidate = [];

	xArrValidate = [
		check('name').not().isEmpty().withMessage('Name is required'),
		check('whitelist_ip').not().isEmpty().withMessage('Whitelist IP is required')
	];
	app.post(_rootAPIPath + 'save', xArrValidate, _thirdPartyUser.save);

	xArrValidate = [];
	app.get(_rootAPIPath + 'token', xArrValidate, _thirdPartyUser.getToken);

	xArrValidate = [ check('refresh_token').not().isEmpty().withMessage('Parameter refresh_token can not empty') ];
	app.post(_rootAPIPath + 'refresh_token', xArrValidate, _thirdPartyUser.refreshToken);
};
