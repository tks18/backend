const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  res.send("This is a Backend for My Portfolio. Super")
});

module.exports = router;
