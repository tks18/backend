// Inititalisation
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const bodyParser = require('body-parser');
const app = express();

//Express Configs
app.use(express.static(__dirname + '/public'));
app.use(express.json({ limit: '50kb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

//Cors
app.use(function (req, res, next) {
  let allowedDomains = process.env.FRONT.split(',');
  var origin = req.headers.origin;
  console.log(allowedDomains, origin);
  if (allowedDomains.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type, Accept',
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server Started on ' + PORT));
