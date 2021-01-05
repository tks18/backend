const express = require("express");
const router = express.Router();
const { join } = require('path')

router.get('/', (req, res) => {
  res.send("Super ")
});

router.use('/author', require(join(__dirname, "author", "index.js")));

module.exports = router;
