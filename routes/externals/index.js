const express = require('express');
const router = express.Router();

router.use('/nasa', require('./nasa'));

module.exports = router;
