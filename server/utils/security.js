const bcrypt = require('bcryptjs');

class Security{
    constructor(){}

    async generatePassword( pPassword ){
        var salt = await bcrypt.genSalt(10);
        var password = await bcrypt.hash( pPassword, salt );
        return password;
    }
}

module.exports = Security;