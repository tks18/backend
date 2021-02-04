// Inititalisation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

//Express Configs
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server Started on ' + PORT));
