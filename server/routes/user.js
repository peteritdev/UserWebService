const userController = require('../controllers').user;

var rootAPIPath = '/api/procurement/v1/';

module.exports = (app) => { 

  app.get(rootAPIPath, (req, res) => res.status(200).send({
    message: 'Welcome to the Todos API!',
  }));
  
  app.post(rootAPIPath + 'user/register', userController.register);  
  app.post(rootAPIPath + 'user/generatePassword', userController.generatePassword);  

  app.get(rootAPIPath + 'user/read', userController.readMsgFile);

};