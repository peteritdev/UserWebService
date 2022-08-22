const _oAuthController = require('../controllers').oAuth;

const { check, validationResult } = require('express-validator');

var _rootAPIPath = '/api/oauth2/v1/';

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

	var arrValidate = [
		check('email').not().isEmpty().withMessage('Parameter email is required'),
		check('password').not().isEmpty().withMessage('Parameter password is required'),
		check('response_type').not().isEmpty().withMessage('Parameter response_type is required'),
		check('client_id').not().isEmpty().withMessage('Parameter client_id is required'),
		check('redirect_uri').not().isEmpty().withMessage('Parameter redirect_uri is required'),
		check('scope').not().isEmpty().withMessage('Parameter scope is required'),
		check('state').not().isEmpty().withMessage('Parameter state is required')
	];
	app.post(_rootAPIPath + 'user/login', arrValidate, _oAuthController.doLogin);

	arrValidate = [];
	arrValidate = [
		check('grant_type').not().isEmpty().withMessage('Parameter grant_type is required'),
		check('client_id').not().isEmpty().withMessage('Parameter client_id is required'),
		check('client_secret').not().isEmpty().withMessage('Parameter client_secret is required'),
		check('redirect_uri').not().isEmpty().withMessage('Parameter redirect_uri is required'),
		check('code').not().isEmpty().withMessage('Parameter code is required'),
		check('scope').not().isEmpty().withMessage('Parameter scope is required')
	];
	app.post(_rootAPIPath + 'token', arrValidate, _oAuthController.token);

	app.get(_rootAPIPath + 'tokeninfo', arrValidate, _oAuthController.tokenInfo);
};
