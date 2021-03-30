const express = require('express');
const router = express.Router();
const { gen_token, check_token } = require('../../../helpers/google-oauth');

// Model
const Tokens = require('../../../models/tokens');

router.post('/data', async (req, res) => {
  const token = await gen_token(
    process.env.GOOG_CL_ID,
    process.env.GOOG_CL_SEC,
    process.env.GOOG_REF_TOKEN,
  );
  const get_token = await check_token('access_token', token.access_token);
  res.send(get_token);
});

module.exports = router;
