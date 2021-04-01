const applicationTableController = require('../controllers').applicationTable;

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
        check("table_name").not().isEmpty().withMessage("Parameter name cannot be empty"),
    ];
    app.post( rootAPIPath + 'application_table/save', arrValidate, applicationTableController.applicationTable_Save );

    // List
    arrValidate = [];   
    arrValidate = [
        check("offset","Parameter offset must be integer and cannot be empty").not().isEmpty().isInt(),
        check("limit","Parameter limit must be integer and cannot be empty").not().isEmpty().isInt(),
    ];
    app.get( rootAPIPath + 'application_table/list', arrValidate, applicationTableController.applicationTable_List );

    arrValidate = [];
    app.get( rootAPIPath + 'application_table/drop_down', arrValidate, applicationTableController.applicationTable_DropDown );

    // Delete
    arrValidate = [];
    arrValidate = [
        check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
    ];
    app.delete( rootAPIPath + 'application_table/delete/:id', applicationTableController.applicationTable_Delete );

}