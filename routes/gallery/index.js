const express = require('express');
const axios = require('axios');

const router = express.Router();
const originCheck = require('../../helpers/checkOrigin');

const url = 'https://api.unsplash.com/';
const path = 'users/shantk18/photos';

router.post('/get', (req, res) => {
  if (originCheck(req.headers.origin)) {
    axios
      .get(`${url}${path}`, {
        params: { per_page: 10, order_by: 'latest' },
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS}`,
        },
      })
      .then((resp) => {
        if (resp.status === 200 && resp.data) {
          res.status(200).json({
            success: true,
            data: resp.data,
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Server Error',
          });
        }
      })
      .catch((error) => {
        res.status(500).json({
          success: false,
          message: 'Server Error',
          error,
        });
      });
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

module.exports = router;
