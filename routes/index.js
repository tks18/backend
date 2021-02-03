const express = require('express');
const router = express.Router();
const { join } = require('path');
const { db, closeConnection } = require('../helpers/mongo');

router.get('/', (req, res) => {
  connection = db();
  connection
    .then((result) => {
      res.send('This is a Backend for My Portfolio. Super');
    })
    .catch((err) => {
      res.send(failed);
    });
  console.log('Finished');
  closeConnection();
});

router.use('/author', require('./author'));

module.exports = router;
