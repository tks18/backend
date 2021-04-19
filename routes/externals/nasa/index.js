const express = require('express');

const router = express.Router();
const axios = require('axios');

const url = 'https://api.nasa.gov/';
const apodpath = 'planetary/apod';
const nasaKey = process.env.NASA_API;

router.post('/apod', (req, res) => {
  axios
    .get(`${url}${apodpath}`, {
      params: { api_key: nasaKey },
    })
    .then((response) => {
      if (response.status === 200 && response.data) {
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
});

module.exports = router;
