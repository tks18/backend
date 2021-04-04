// Inititalisation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
app.use(
  cors({
    origin: process.env.ORIGIN,
    optionsSuccessStatus: 200,
    methods: 'GET, POST',
  }),
);
app.use(mongoSanitize());
app.use(xss());

//Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server Started on ' + PORT));
