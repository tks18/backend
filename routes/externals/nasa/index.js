const express = require('express');
const router = express.Router();
const originCheck = require('../../../helpers/checkOrigin');
const axios = require('axios');

let url = 'https://api.nasa.gov/';
let apodpath = 'planetary/apod';
let nasaKey = process.env.NASA_API;

router.post('/apod', (req, res) => {
  if (originCheck(req.headers.origin)) {
    axios
      .get(`${url}${apodpath}`, {
        params: { api_key: nasaKey },
      })
      .then((response) => {
        if (response.status == 200 && response.data) {
          res.status(200).json({
            success: true,
            data: response.data,
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
