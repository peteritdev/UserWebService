const userController = require('../controllers').user;

var rootAPIPath = '/api/procurement/v1/';

module.exports = (app) => { 

  app.get(rootAPIPath, (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));
  
  app.post(rootAPIPath + 'user/register', userController.register);  
  app.post(rootAPIPath + 'user/generate_password', userController.generatePassword);  
  app.post(rootAPIPath + 'user/verify_account', userController.verifyAccount);
  app.post(rootAPIPath + 'user/login', userController.login);
  app.post(rootAPIPath + 'user/login_google', userController.loginGoogle);
  app.post(rootAPIPath + 'user/parse_google_code', userController.parseQueryGoogle);
  app.post(rootAPIPath + 'user/forgot_password', userController.forgotPassword);  
  app.post(rootAPIPath + 'user/verify_forgot_password', userController.verifyForgotPassword);  
  app.post(rootAPIPath + 'user/change_password', userController.changePassword);  

};