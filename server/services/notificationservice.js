const env         = process.env.NODE_ENV || 'localhost';
const config      = require(__dirname + '/../config/config.json')[env];

const moment = require('moment');

// Services
const OAuthService = require('../services/oauthservice.js');
const _oAuthService = new OAuthService();

const NotificationTemplateService = require('../services/notificationtemplateservice.js');
const _notificationTemplateServiceInstance = new NotificationTemplateService();

//Util
const Utility = require('peters-globallib-v2');
const _utilInstance = new Utility();

class NotificationService {
    constructor() {}

    async eSanqua_NewEmployeeRegister_ReplaceWithVariable( pMsg, pParam ){


        pMsg = pMsg.toString();
        pMsg = pMsg.replace( "#USER_NAME#", pParam.name );
        pMsg = pMsg.replace( "#EMAIL#", pParam.name );
        pMsg = pMsg.replace( "#PASSWORD#", pParam.password );

        return pMsg;

    }

    async sendNotification_NewEmployeeRegister( pMethod, pToken, pParam ){
        var xJoResult = {};
        var xNotifTemplate = await _oAuthService.getNotificationTemplate( pMethod, pToken, 'ESANQUA_REGISTRATION' );

        if( xNotifTemplate != null ){
            var xSubject = await this.eSanqua_NewEmployeeRegister_ReplaceWithVariable( xNotifTemplate.token_data.data.subject, pParam );
            var xBody = await this.eSanqua_NewEmployeeRegister_ReplaceWithVariable( xNotifTemplate.token_data.data.body, pParam );

            // Kafka send notification
            var xStringifyBody = xBody.replace(/\"/g,"\\\"");
            var xParamKafkaProducer = {
                mode: 'eSanqua-Oauth',
                broker_host: '10.10.20.8',
                broker_port: 9092,
                client_id: 'eSanqua-Oauth',
                key: 'K003',
                message: (`{"subject": "${xSubject}","body": "${xStringifyBody}","recipients": {"to": "${pParam.vendor.email}"}}`),
            }

            xJoResult = await _utilInstance.sendNotification( xParamKafkaProducer );            

        }else{
            xJoResult = {
                status_code: '-99',
                status_msg: 'Template doesn\'t exists! ',
            }
        }

        return xJoResult;
    }

}

module.exports = NotificationService;