const approvalMatrixDocumentController = require('../controllers').approvalMatrixDocument;

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

	// Confirm
	arrValidate = [];
	arrValidate = [
		check('document_id').not().isEmpty().withMessage('Parameter document_id cannot be empty'),
		check('status', 'Parameter status_confirm must be integer and cannot be empty').not().isEmpty().isInt()
	];
	app.post(
		rootAPIPath + 'approval_matrix/document/confirm',
		arrValidate,
		approvalMatrixDocumentController.approvalMatrixDocumentUser_ConfirmDocument
	);

	// Confirm Via Email
	arrValidate = [];
	arrValidate = [
		check('document_id').not().isEmpty().withMessage('Parameter document_id cannot be empty'),
		check('status', 'Parameter status_confirm must be integer and cannot be empty').not().isEmpty().isInt(),
		check('user_id', 'Parameter user_id must be integer and cannot be empty').not().isEmpty().isInt()
	];
	app.post(
		rootAPIPath + 'approval_matrix/document/confirm_via_email',
		arrValidate,
		approvalMatrixDocumentController.approvalMatrixDocumentUser_ConfirmDocumentViaEmail
	);

	// Save Manual
	arrValidate = [];
	app.post(
		rootAPIPath + 'approval_matrix/document/save_manual',
		arrValidate,
		approvalMatrixDocumentController.approvalMatrixDocument_Save
	);

	// Save
	arrValidate = [];
	arrValidate = [
		check('document_id').not().isEmpty().withMessage('Parameter document_id cannot be empty'),
		check('document_no').not().isEmpty().withMessage('Parameter document_no cannot be empty'),
		check('application_id', 'Parameter application_id must be integer and cannot be empty').not().isEmpty().isInt()
	];
	app.post(
		rootAPIPath + 'approval_matrix/document/save',
		arrValidate,
		approvalMatrixDocumentController.approvalMatrixDocument_Save
	);

	// List
	arrValidate = [];
	arrValidate = [
		check('offset', 'Parameter offset must be integer and cannot be empty').not().isEmpty().isInt(),
		check('limit', 'Parameter limit must be integer and cannot be empty').not().isEmpty().isInt(),
		check('document_id').not().isEmpty().withMessage('Parameter document_id cannot be empty'),
		check('application_id', 'Parameter application_id must be integer and cannot be empty').not().isEmpty().isInt()
	];
	app.get(
		rootAPIPath + 'approval_matrix/document/list',
		arrValidate,
		approvalMatrixDocumentController.approvalMatrixDocument_List
	);

	// List
	arrValidate = [];
	arrValidate = [ check('document_id').not().isEmpty().withMessage('Parameter document_id cannot be empty') ];
	app.get(
		rootAPIPath + 'approval_matrix/document/allow_user',
		arrValidate,
		approvalMatrixDocumentController.approvalMatrixDocument_IsUserAllow
	);

	// Delete
	arrValidate = [];
	arrValidate = [ check('id').not().isEmpty().withMessage('Parameter id cannot be empty') ];
	app.post(
		rootAPIPath + 'approval_matrix/document/delete',
		approvalMatrixDocumentController.approvalMatrixDocument_Delete
	);

	arrValidate = [];
	arrValidate = [ check('signature').not().isEmpty().withMessage('Parameter signature can not be empty') ];
	app.get(
		rootAPIPath + 'approval_matrix/document/verify_approval',
		approvalMatrixDocumentController.approvalMatrixDocument_VerifyApprovalByQRCode
	);
};
