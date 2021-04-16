const axios = require('axios');
const express = require('express');

const router = express.Router();

// Local
const db = require('../../helpers/mongo');
const { refresh_token } = require('../../helpers/ig-oauth');
const api = require('./api');
const origin_check = require('../../helpers/checkOrigin');

// Model
const Tokens = require('../../models/tokens');

router.post('/', (req, res) => {
  if (origin_check(req.headers.origin)) {
    db.connect()
      .then(() => {
        Tokens.findOne(
          {
            website: 'instagram.com',
            scope: 'profile,media',
            type: 'access',
          },
          async (error, access_token) => {
            if (!error && access_token) {
              const token_refresh = await refresh_token(access_token);
              if (token_refresh.success) {
                if (token_refresh.refreshed) {
                  res.status(404).json({
                    success: false,
                    message: 'Work in Proress',
                  });
                } else {
                  axios
                    .get(api.media(access_token.token))
                    .then((response) => {
                      if (response.status === 200 && response.data) {
                        const posts = response.data.data;
                        res.status(200).json({
                          success: true,
                          posts,
                        });
                      } else {
                        res.status(500).json({
                          success: false,
                          error:
                            'Error Occured while getting posts from Instagram',
                        });
                      }
                    })
                    .catch((fetch_error) => {
                      res.status(500).json({
                        success: false,
                        error: 'Error while getting Posts from Instagram',
                        additional_error: fetch_error.response.data,
                      });
                    });
                }
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Error Occured while refreshing the Token',
                });
              }
            }
          },
        );
      })
      .catch((err) => {
        res.status(500).json({
          success: false,
          err,
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
