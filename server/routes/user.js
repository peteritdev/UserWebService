const userController = require('../controllers').user;

const { check, validationResult } = require('express-validator');

var rootAPIPath = '/simpeg/oauth/v1/';

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

	var arrValidateRegister = [
		check('name').not().isEmpty().withMessage('Name is required'),
		// check('email', 'Email is required').isEmail(),
		check('password', 'Password is required or format is invalid').isLength({ min: 6 })
	];
	app.post(rootAPIPath + 'user/register', arrValidateRegister, userController.register);

	app.post(rootAPIPath + 'user/generate_password', userController.generatePassword);

	var arrValidateVerify = [ check('code').not().isEmpty().withMessage('Code is required') ];
	app.post(rootAPIPath + 'user/verify_account', arrValidateVerify, userController.verifyAccount);

	var arrValidateLogin = [
		// check("email").isEmail().withMessage("Invalid email format"),
		check('email').not().isEmpty().withMessage('Email is required'),
		check('password').not().isEmpty().withMessage('Password is required')
	];
	app.post(rootAPIPath + 'user/login', arrValidateLogin, userController.login);

	app.post(rootAPIPath + 'user/login_google', userController.loginGoogle);

	var arrValidateParseQueryGoogle = [ check('code').not().isEmpty().withMessage('Code is required') ];
	app.post(rootAPIPath + 'user/parse_google_code', arrValidateParseQueryGoogle, userController.parseQueryGoogle);

	var arrValidateVerifyToken = [
		check('token').not().isEmpty().withMessage('Token is required'),
		check('method').not().isEmpty().withMessage('Method is required')
	];
	app.get(rootAPIPath + 'user/verify_token', arrValidateVerifyToken, userController.verifyToken);

	var arrValidateForgotPassword = [ check('email').isEmail().withMessage('Invalid email format') ];
	app.post(rootAPIPath + 'user/forgot_password', arrValidateForgotPassword, userController.forgotPassword);

	var arrValidateVerifyForgotPassword = [ check('code').not().isEmpty().withMessage('Code is required') ];
	app.post(
		rootAPIPath + 'user/verify_forgot_password',
		arrValidateVerifyForgotPassword,
		userController.verifyForgotPassword
	);

	var arrValidateChangePassword = [
		check('code').not().isEmpty().withMessage('Code is required'),
		check('email').not().isEmpty().withMessage('Email is required'),
		// check('email').isEmail().withMessage('Invalid email format'),
		check('new_password', 'Password is required or format is invalid').isLength({ min: 6 })
	];
	app.post(rootAPIPath + 'user/change_password', arrValidateChangePassword, userController.changePassword);

	var arrValidateChangePassword = [
		check('email').not().isEmpty().withMessage('Email is required'),
		check('new_password', 'Password is required or format is invalid').isLength({ min: 6 }),
		check('old_password', 'Password is required or format is invalid').isLength({ min: 6 })
	];
	app.post(
		rootAPIPath + 'user/logged_change_password',
		arrValidateChangePassword,
		userController.loggedChangePassword
	);

	var arrValidateAddVendorId = [
		check('vendor_id').not().isEmpty().withMessage('Vendor Id is required'),
		check('user_id').not().isEmpty().withMessage('User Id is required')
	];
	app.post(rootAPIPath + 'user/update_vendor_id', arrValidateAddVendorId, userController.addVendorId);

	// Admin Site
	var arrValidateUserList = [];
	app.get(rootAPIPath + 'user/list', arrValidateUserList, userController.list);
	app.get(rootAPIPath + 'user/drop_down', arrValidateUserList, userController.dropDownList);

	var arrValidateUserSave = [
		check('name').not().isEmpty().withMessage('Name is required'),
		check('email').isEmail().withMessage('Invalid email format'),
		// check("password").isEmpty().withMessage("Password is required"),
		check('status', 'Status must be a number').not().isEmpty().isInt(),
		check('company_id', 'Company Id must be a number').not().isEmpty().isInt()
	];
	app.post(rootAPIPath + 'user/save', arrValidateUserSave, userController.save);

	var arrValidateUserDelete = [ check('id').not().isEmpty().withMessage('Id is required') ];
	app.post(rootAPIPath + 'user/delete/:id', arrValidateUserDelete, userController.deleteUser);

	app.get(rootAPIPath + 'user/e/:employeeId', [], userController.getUserByEmployeeId);

	app.post(rootAPIPath + 'user/encrypt_password', userController.getEncryptedPassword);

	var arrValidate = [];
	app.post(rootAPIPath + 'user/generate_credentials', arrValidate, userController.generateClientIDAndClientSecret);
};
