const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  res.send("Super ")
});

router.use('/author', require('./author'));

module.exports = router;
