const env         = process.env.NODE_ENV || 'localhost';
const config      = require(__dirname + '/../config/config.json')[env];

const moment = require('moment');

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

    async sendNotification_NewEmployeeRegister( pParam ){
        var xJoResult = {};
        var xNotifTemplate = await _notificationTemplateServiceInstance.getByCode({code: 'ESANQUA_REGISTRATION'});

        if( xNotifTemplate != null ){
            var xSubject = await this.eSanqua_NewEmployeeRegister_ReplaceWithVariable( xNotifTemplate.data.subject, pParam );
            var xBody = await this.eSanqua_NewEmployeeRegister_ReplaceWithVariable( xNotifTemplate.data.body, pParam );

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