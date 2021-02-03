// Inititalisation
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

//Express Configs
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Connect mongo
mongoose.connect(process.env.DBURL, {
  useUnifiedTopology: true,
  bufferCommands: false,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useCreateIndex: true,
});

//Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log('Server Started on ' + PORT));
