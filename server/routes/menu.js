const menuController = require('../controllers').menu;
const { check, validationResult } = require('express-validator');

var rootAPIPath = '/api/oauth/v1/';

module.exports = (app) => {
    app.get(rootAPIPath, (req, res) => res.status(200).send({
        message: 'Welcome to the Todos API!',
    }));
    
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-method, x-token, x-application-id");
        next();
    });

    arrValidate = [];
    arrValidate = [
        check('name').not().isEmpty().withMessage('Parameter name is required'),
        check('application_id','Parameter application_id is required and must be numeric').not().isEmpty().isInt(),
    ];
    app.post( rootAPIPath + 'menu/save', arrValidate, menuController.save );

    arrValidate = [];
    arrValidate = [
        check('limit','Parameter limit is required and must be numeric').not().isEmpty().isInt(),
        check('offset','Parameter offset is required and must be numeric').not().isEmpty().isInt(),
        // check('app').not().isEmpty().withMessage('Parameter app is required'),
    ];
    app.get( rootAPIPath + 'menu/list', arrValidate, menuController.list );

    arrValidate = [];
    app.get( rootAPIPath + 'menu/drop_down', arrValidate, menuController.dropDownList );

    arrValidate = [];
    arrValidate = [
        check('id').not().isEmpty().withMessage('Parameter id is required'),
    ];
    app.get( rootAPIPath + 'menu/detail/:id', arrValidate, menuController.getMenuById );

    arrValidate = [];
    arrValidate = [
        check('id').not().isEmpty().withMessage('Parameter id is required'),
    ];
    app.post( rootAPIPath + 'menu/delete/:id', arrValidate, menuController.deleteMenu );
}