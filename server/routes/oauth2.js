const _oAuthController = require('../controllers').oAuth2;

const { check, validationResult, body, header } = require('express-validator');
const { head } = require('request');

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
		check('code').not().isEmpty().withMessage('Parameter code is required')
		// check('scope').not().isEmpty().withMessage('Parameter scope is required')
	];
	app.post(_rootAPIPath + 'access_token', arrValidate, _oAuthController.token);

	arrValidate = [];
	arrValidate = [
		body('grantType').not().isEmpty().withMessage('Invalid mandatory field [grantType]'),
		header('X-TIMESTAMP').not().isEmpty().withMessage('Invalid mandatory field [X-TIMESTAMP]'),
		header('X-CLIENTKEY').not().isEmpty().withMessage('Invalid mandatory field [X-CLIENTKEY]'),
		header('X-SIGNATURE').not().isEmpty().withMessage('Invalid mandatory field [X-SIGNATURE]')
	];
	app.post(_rootAPIPath + 'bca/access_token', arrValidate, _oAuthController.accessTokenBCA);

	arrValidate = [];
	app.get(_rootAPIPath + 'userinfo', arrValidate, _oAuthController.tokenInfo);
	app.get(_rootAPIPath + 'tokenprofile', arrValidate, _oAuthController.tokenProfile);

	var arrValidate = [
		check('client_id').not().isEmpty().withMessage('Parameter email is required'),
		check('redirect_uri').not().isEmpty().withMessage('Parameter password is required'),
		check('state').not().isEmpty().withMessage('Parameter response_type is required')
	];
	app.post(_rootAPIPath + 'client/check_credential', arrValidate, _oAuthController.checkClientCredential);
};
