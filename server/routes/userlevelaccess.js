const userLevelAccessController = require('../controllers').userLevelAccess;
const { check, validationResult } = require('express-validator');

var rootAPIPath = '/api/oauth/v1/';

module.exports = (app) => {
    app.get(rootAPIPath, (req, res) => res.status(200).send({
        message: 'Welcome to the Todos API!',
    }));
    
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-method, x-token");
        next();
    });

    arrValidate = [];
    arrValidate = [
        check('menu_id','Parameter menu_id is required and must numeric').not().isEmpty().isInt(),
        check('level_id').not().isEmpty().withMessage('Parameter level_id is required'),        
        check('create_perm','Parameter create_perm is required and must numeric').not().isEmpty().isInt(),
        check('read_perm','Parameter create_perm is required and must numeric').not().isEmpty().isInt(),
        check('update_perm','Parameter create_perm is required and must numeric').not().isEmpty().isInt(),
        check('delete_perm','Parameter create_perm is required and must numeric').not().isEmpty().isInt(),
    ];
    app.post( rootAPIPath + 'user_level_access/save', arrValidate, userLevelAccessController.save );

    arrValidate = [];
    arrValidate = [
        check('limit','Parameter limit is required and must be numeric').not().isEmpty().isInt(),
        check('offset','Parameter offset is required and must be numeric').not().isEmpty().isInt(),
        check('app').not().isEmpty().withMessage('Parameter app is required'),
        check('level_id').not().isEmpty().withMessage('Parameter level_id is required and must be numeric'),
    ];
    app.get( rootAPIPath + 'user_level_access/list', arrValidate, userLevelAccessController.list );

    arrValidate = [
        check('menu_id','Parameter menu_id is required and must be numeric').not().isEmpty().isInt(),
        check('level_id','Parameter level_id is required and must be numeric').not().isEmpty().isInt(),
    ];
    app.get( rootAPIPath + 'user_level_access/get_access', arrValidate, userLevelAccessController.getByMenuIdAndLevelId );

    arrValidate = [];
    arrValidate = [
        check('id').not().isEmpty().withMessage('Parameter id is required'),
    ];
    app.post( rootAPIPath + 'user_level_access/delete/:id', arrValidate, userLevelAccessController.deleteUserLevelAccess );
}