// Inititalisation
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const bodyParser = require('body-parser');
const Path = require('path');
const checkOrigin = require('./middleware/checkOrigin');
const secureTunnel = require('./middleware/secureTunnel');

// Express Configs
const app = express();
app.use(express.static(Path.join(__dirname, 'public')));
app.use(express.json({ limit: '50kb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(checkOrigin);
app.use(secureTunnel);

// Cors
app.use((req, res, next) => {
  const allowedDomains = process.env.FRONT.split(',');
  const { origin } = req.headers;
  console.log(allowedDomains, origin);
  if (allowedDomains.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type, Accept,secure_hash,requested_at',
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Routes
app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;

app.listen(PORT);
