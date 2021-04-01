const approvalMatrixController = require('../controllers').approvalMatrix;

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

    var arrValidate = [];

    // APPLICATION   
    // Save
    arrValidate = [];
    arrValidate = [
        check("application_table_id","Parameter application_table_id must be integer and cannot be empty").not().isEmpty().isInt(),
    ];
    app.post( rootAPIPath + 'approval_matrix/save', arrValidate, approvalMatrixController.approvalMatrix_Save );

    // List
    arrValidate = [];
    arrValidate = [
        check("offset","Parameter offset must be integer and cannot be empty").not().isEmpty().isInt(),
        check("limit","Parameter limit must be integer and cannot be empty").not().isEmpty().isInt(),
    ];
    app.get( rootAPIPath + 'approval_matrix/list', arrValidate, approvalMatrixController.approvalMatrix_List );

    // Delete
    arrValidate = [];
    arrValidate = [
        check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
    ];
    app.delete( rootAPIPath + 'approval_matrix/delete/:id', approvalMatrixController.approvalMatrix_Delete );

}