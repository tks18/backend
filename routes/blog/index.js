const express = require('express');

const router = express.Router();
const blogQuery = require('../../helpers/hashnode');

router.post('/get', async (req, res) => {
  const response = await blogQuery();
  res.status(200).json(response);
});

module.exports = router;
