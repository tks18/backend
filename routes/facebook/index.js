const express = require('express');
const router = express.Router();

//Local
const {
  get_auth_code_url,
  gen_token,
} = require('../../helpers/facebook-oauth');
const db = require('../../helpers/mongo');

//Model
const Token = require('../../models/tokens');

router.get('/oauth', (req, res) => {
  db.connect()
    .then(() => {
      Token.findOne(
        {
          website: 'facebook.com',
          type: 'client_details',
          scope: 'instagram_basic_display',
        },
        async (error, fb_details) => {
          if (!error && fb_details) {
            let client_secret = fb_details;
            let client_id = fb_details.additional_tokens.filter((token) => {
              return token.type == 'client_id';
            })[0];
            let app_token = fb_details.additional_tokens.filter((token) => {
              return token.type == 'app_token';
            })[0];
            if (req.query && req.query.code) {
              let auth_code = req.query.code;
              let access_code_response = await gen_token(
                client_id.token,
                client_secret.token,
                auth_code,
              );
              if (access_code_response.success) {
                Token.findOne(
                  {
                    website: 'facebook.com',
                    type: 'access',
                    scope: 'instagram_basic_display',
                  },
                  (error, old_access_token) => {
                    if (
                      !error &&
                      old_access_token &&
                      old_access_token.length > 0
                    ) {
                      Token.deleteOne(old_access_token[0], (error) => {
                        if (!error) {
                          let expiry_time =
                            Date.now() + access_code_response.expires_in * 1000;
                          let newAccessToken = Token({
                            token: access_code_response.access_token,
                            type: 'access',
                            website: 'facebook.com',
                            time: Date.now(),
                            expires_in: expiry_time,
                            scope: 'instagram_basic_display',
                          });
                          newAccessToken.save((error, new_token) => {
                            if (!error && new_token) {
                              res.status(200).json({
                                success: true,
                                message:
                                  'Successfully Saved your token to DB. Now Call your apps with this token',
                                expires_in: expiry_time,
                              });
                            } else {
                              res.status(500).json({
                                success: false,
                                error: 'Error While Saving new token in DB',
                              });
                            }
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Not able to Delete old Tokens',
                          });
                        }
                      });
                    } else {
                      let expiry_time =
                        Date.now() + access_code_response.expires_in * 1000;
                      let newAccessToken = Token({
                        token: access_code_response.access_token,
                        type: 'access',
                        website: 'facebook.com',
                        time: Date.now(),
                        expires_in: expiry_time,
                        scope: 'instagram_basic_display',
                      });
                      newAccessToken.save((error, new_token) => {
                        if (!error && new_token) {
                          res.status(200).json({
                            success: true,
                            message:
                              'Successfully Saved your token to DB. Now Call your apps with this token',
                            expires_in: expiry_time,
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Error While Saving new token in DB',
                          });
                        }
                      });
                    }
                  },
                );
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Internal Server Error',
                });
              }
            } else {
              let auth_url = get_auth_code_url(client_id.token);
              res.redirect(auth_url);
            }
          } else {
            res.status(500).json({
              success: false,
              error:
                'No Access and Client Tokens found, Not able to Proceed Hereafter',
              additional_error: error,
            });
          }
        },
      );
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        error: err,
      });
    });
});

router.use('/ig', require('./ig'));

module.exports = router;
