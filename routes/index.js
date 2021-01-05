const express = require("express");
const router = express.Router();
const { join } = require('path')
path = process.env.NODE_ENV == "production" ? join(__dirname, "routes") : join(__dirname)

router.get('/', (req, res) => {
  res.send("Super ")
});

router.use('/author', require(join(path, "author", "index.js")));

module.exports = router;
