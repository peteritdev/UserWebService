const userUserLevelController = require('../controllers').userUserLevel;
const { check, validationResult } = require('express-validator');

var rootAPIPath = '/api/oauth/v1/';

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

	arrValidate = [];
	arrValidate = [
		// check('employee_user_id').not().isEmpty().withMessage('Parameter user_id is required'),
		check('user_level_id', 'Parameter user_level_id is required and must be numeric').not().isEmpty().isInt()
	];
	app.post(rootAPIPath + 'user_app/save', arrValidate, userUserLevelController.userUserLevel_Save);

	arrValidate = [];
	arrValidate = [
		// check('employee_user_id').not().isEmpty().withMessage('Parameter user_id is required'),
		check('user_level_id', 'Parameter user_level_id is required and must be numeric').not().isEmpty().isInt(),
		check('assign_by', 'Parameter assign_by is required and must be numeric').not().isEmpty().isInt()
	];
	app.post(
		rootAPIPath + 'user_app/batch_assign_app',
		arrValidate,
		userUserLevelController.userUserLevel_BatchAssignApplicaation
	);

	arrValidate = [];
	arrValidate = [
		check('limit', 'Parameter limit is required and must be numeric').not().isEmpty().isInt(),
		check('offset', 'Parameter offset is required and must be numeric').not().isEmpty().isInt()
		// check('employee_user_id').not().isEmpty().withMessage('Parameter user_id is required'),
	];
	app.get(rootAPIPath + 'user_app/list', arrValidate, userUserLevelController.userUserLevel_List);

	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id is required') ];
	app.delete(rootAPIPath + 'user_app/delete/:id', arrValidate, userUserLevelController.userUserLevel_Delete);
};
