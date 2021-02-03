const express = require('express');
const router = express.Router();
const { db, closeConnection } = require('../../helpers/mongo');

router.get('/', async (req, res) => {
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

module.exports = router;
