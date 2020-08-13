const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var config = require('../config/config.json');

class Security{
    constructor(){}

    async generateEncryptedPassword( pPassword ){
        var salt = await bcrypt.genSalt(10);
        var password = await bcrypt.hash( pPassword, salt );
        return password;
    }

    async verifyToken( pToken ){
        try{
            var decoded = jwt.verify( pToken, config.secret );
            return {
                status_code: "00",
                status_msg: "OK",
                decoded: decoded
            }
        }catch(err){
            return {
                status_code: "-99",
                status_msg: "Error verify token : " + err
            }
        }
    }
}

module.exports = Security;