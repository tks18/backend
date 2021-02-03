const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../helpers/mongo');

router.get(/(\/.*)+/, (req, res) => {
  db.connect()
    .then(() => {
      res.status(403).sendFile(path.resolve(__dirname, '../views/index.html'));
    })
    .catch((err) => {
      res.send(err);
    });
  db.close();
});

module.exports = router;
