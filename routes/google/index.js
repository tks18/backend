const express = require('express');

const router = express.Router();

router.use('/youtube', require('./youtube'));

module.exports = router;
