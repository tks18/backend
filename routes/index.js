const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../helpers/mongo');

router.use('/blog', require('./blog'));
router.use('/author', require('./author'));
router.use('/stories', require('./stories'));

router.get(/(\/.*)+/, (req, res) => {
  res.status(401).sendFile(path.resolve(__dirname, '../views/index.html'));
});

module.exports = router;
