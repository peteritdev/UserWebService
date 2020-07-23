const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');

const cors = require('cors');

// Set up the express app
const app = express();

//Log requests to the console
app.use( logger('dev') );

// parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(expressValidator());

// Setup a default catch-all route that sends back a welcome message in JSON format.
require('./server/routes')(app);


app.get('*', (req, res) => res.status(200).send({
  message: 'Welcome to the beginning of nothingness.',
}));

module.exports = app;