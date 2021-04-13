const notificationTemplateController = require('../controllers').notificationTemplate;

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
        check("name").not().isEmpty().withMessage("Parameter name cannot be empty"),
    ];
    app.post( rootAPIPath + 'notification_template/save', arrValidate, notificationTemplateController.notificationTemplate_Save );

    // List
    arrValidate = [];
    arrValidate = [
        check("offset","Parameter offset must be integer and cannot be empty").not().isEmpty().isInt(),
        check("limit","Parameter limit must be integer and cannot be empty").not().isEmpty().isInt(),
    ];
    app.get( rootAPIPath + 'notification_template/list', arrValidate, notificationTemplateController.notificationTemplate_List );

    arrValidate = [];
    app.get( rootAPIPath + 'notification_template/detail/:id', arrValidate, notificationTemplateController.notificationTemplate_GetById );

    arrValidate = [];
    app.get( rootAPIPath + 'notification_template/detail/code/:code', arrValidate, notificationTemplateController.notificationTemplate_GetByCode );

    // Delete
    arrValidate = [];
    arrValidate = [
        check("id").not().isEmpty().withMessage("Parameter id cannot be empty"),
    ];
    app.delete( rootAPIPath + 'notification_template/delete/:id', notificationTemplateController.notificationTemplate_Delete );

}