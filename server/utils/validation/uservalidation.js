const { timingSafeEqual } = require("crypto");

class UserValidation {

    constructor(){}

    async register(req){   
        req.checkBody('name').not().isEmpty().withMessage("Name is required");
        req.checkBody('email','Email is required').isEmail();
        req.checkBody('password', 'Password is required or format is invalid').isLength({min:6});
        var errors = req.validationErrors();
        return errors;
    }

    async verifyAccount(req){
        req.checkBody('code').not().isEmpty().withMessage("Code is required");
        var errors = req.validationErrors();
        return errors;
    }

    async login(req){
        req.checkBody('email','Email is required').isEmail().withMessage("Invalid email format");
        req.checkBody('password', 'Password is required');
        var errors = req.validationErrors();
        return errors;
    }

    async forgotPassword(req){
        req.checkBody('email','Email is required').isEmail().withMessage("Invalid email format");
        var errors = req.validationErrors();
        return errors;
    }

    async changePassword(req){        

        req.checkBody('new_password','New password is required');

        if( req.body.source == "FORGOT_PASSWORD" ){
            req.checkBody('code','Verification code is required');
        }else if( req.body.source == "CHANGE_PASSWORD" ){
            req.checkBody('email','Email is required');
            req.checkBody('old_password','Old password');
        }
        
        var errors = req.validationErrors();
        return errors;
    }

    /*async verifyToken(req){
        req.checkHeaders('X-API-TOKEN').not().isEmpty().withMessage("Token is required");
        req.checkHeaders('X-LOGIN-METHOD').not().isEmpty.withMessage("Method is required");
        var errors = req.validationErrors();
        return errors;
    }*/
}

module.exports = UserValidation;