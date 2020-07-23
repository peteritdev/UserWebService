class UserValidation {

    constructor(){}

    async register(req){   
        req.checkBody('name').not().isEmpty().withMessage("Name is required");
        req.checkBody('email','Email is required').isEmail();
        req.checkBody('password', 'Password is required or format is invalid').isLength({min:6});
        var errors = req.validationErrors();
        return errors;
    }
}

module.exports = UserValidation;