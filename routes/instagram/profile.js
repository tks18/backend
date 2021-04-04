const axios = require('axios');
const express = require('express');
const router = express.Router();

//Local
const db = require('../../helpers/mongo');
const { refresh_token } = require('../../helpers/ig-oauth');
const api = require('./api');
const origin_check = require('../../helpers/checkOrigin');

//Model
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
              let token_refresh = await refresh_token(access_token);
              if (token_refresh.success) {
                if (token_refresh.refreshed) {
                } else {
                  axios
                    .get(api.profile(access_token.token))
                    .then((response) => {
                      if (response.status == 200 && response.data) {
                        res.status(200).json({
                          success: true,
                          ...response.data,
                        });
                      } else {
                        res.status(500).json({
                          success: false,
                          error:
                            'Error Occured while getting posts from Instagram',
                        });
                      }
                    })
                    .catch((error) => {
                      res.status(500).json({
                        success: false,
                        error: 'Error while getting Posts from Instagram',
                        additional_error: error.response.data,
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
        console.log(err);
      });
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

module.exports = router;
