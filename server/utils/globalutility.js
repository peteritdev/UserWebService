const crypto = require('crypto');
var config = require('../config/config.json');
const encKey = config.cryptoKey.hashKey
const dateTime = require('node-datetime');

class GlobalUtility{

    async getCurrDateTime(){
        var dt = dateTime.create();
        var formatted = dt.format('Y-m-d H:M:S');
        return formatted;
    }

    async encrypt( pVal ){
        let iv = crypto.randomBytes(IV_LENGTH);
        let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encKey), iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return ( iv.toString('hex') + ':' + encrypted.toString('hex') );
    }

    async decrypt( pVal ){
        if( data != '' ){
            let textParts = data.split(':');
            let iv = Buffer.from(textParts.shift(), 'hex');
            let encryptedText = Buffer.from(textParts.join(':'), 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encKey), iv);
            let decrypted = decipher.update(encryptedText);

            decrypted = Buffer.concat([decrypted, decipher.final()]);

            return decrypted.toString();
        }else{
            return "";
        }
    }

}

module.exports = GlobalUtility;