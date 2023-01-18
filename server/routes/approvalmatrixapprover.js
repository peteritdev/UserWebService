const approvalMatrixApproverController = require('../controllers').approvalMatrixApprover;

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

	var arrValidate = [];

	// Save
	arrValidate = [];
	arrValidate = [
		check('approval_matrix_id').not().isEmpty().withMessage('Parameter approval_matrix_id cannot be empty')
	];
	app.post(
		rootAPIPath + 'approval_matrix/approver/save',
		arrValidate,
		approvalMatrixApproverController.approvalMatrixApprover_Save
	);

	// List
	arrValidate = [];
	arrValidate = [
		check('offset', 'Parameter offset must be integer and cannot be empty').not().isEmpty().isInt(),
		check('limit', 'Parameter limit must be integer and cannot be empty').not().isEmpty().isInt()
	];
	app.get(
		rootAPIPath + 'approval_matrix/approver/list',
		arrValidate,
		approvalMatrixApproverController.approvalMatrixApprover_List
	);

	// Detail
	arrValidate = [];
	app.get(
		rootAPIPath + 'approval_matrix/approver/detail',
		arrValidate,
		approvalMatrixApproverController.approvalMatrixApprover_GetById
	);

	// Delete
	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id cannot be empty') ];
	app.delete(
		rootAPIPath + 'approval_matrix/approver/delete/:id',
		approvalMatrixApproverController.approvalMatrixApprover_Delete
	);
};
