const express = require('express');

const router = express.Router();

// Local
const { ig_request } = require('../../helpers/ig-oauth');
const api = require('./api');

router.post('/', (req, res) => {
  ig_request({
    url: api.profile,
    res,
    keyword: 'profile',
  });
});

module.exports = router;
