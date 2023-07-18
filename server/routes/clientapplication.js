const _clientApplicationController = require('../controllers').clientApplication;

const { check, validationResult } = require('express-validator');
var _rootAPIPath = '/api/oauth2/v1/client_application';

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

	var arrValidate = [];

	arrValidate = [
		check('name').not().isEmpty().withMessage('Parameter name can not be empty'),
		check('host').not().isEmpty().withMessage('Parameter host can not be empty'),
		check('redirect_uri').not().isEmpty().withMessage('Parameter redirect_uri can not be empty')
	];
	app.post(_rootAPIPath + '/save', arrValidate, _clientApplicationController.save);

	arrValidate = [];
	arrValidate = [
		check('limit', 'Parameter limit can not be empty and must be integer').not().isEmpty().isInt(),
		check('offset', 'Parameter offset can not be empty and must be integer').not().isEmpty().isInt()
	];
	app.get(_rootAPIPath + '/list', arrValidate, _clientApplicationController.list);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.get(_rootAPIPath + '/detail/:id', arrValidate, _clientApplicationController.detail);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id can not be empty') ];
	app.delete(_rootAPIPath + '/delete/:id', arrValidate, _clientApplicationController.deletePermanent);
};
