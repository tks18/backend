const express = require("express");
const router = express.Router();
const { join } = require('path')

router.get('/', (req, res) => {
  res.send("Super ")
});

router.get('/author', (req, res) => {
  res.send("Super ")
});

module.exports = router;
