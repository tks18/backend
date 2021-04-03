const express = require('express');
const router = express.Router();

//Local
const db = require('../../helpers/mongo');
const { get_auth_code_url, gen_token } = require('../../helpers/ig-oauth');

//Model
const Tokens = require('../../models/tokens');

router.get('/oauth', (req, res) => {
  db.connect()
    .then(() => {
      Tokens.findOne(
        {
          website: 'instagram.com',
          scope: 'profile,media',
          type: 'client_details',
        },
        async (error, client_details) => {
          if (!error && client_details) {
            let client_secret = client_details;
            let client_id = client_details.additional_tokens.filter((token) => {
              return token.type == 'client_id';
            })[0];
            if (req.query && req.query.code) {
              let auth_code = req.query.code;
              let auth_response = await gen_token(
                client_id.token,
                client_secret.token,
                auth_code,
              );
              if (auth_response.success) {
                Tokens.find(
                  {
                    website: 'instagram.com',
                    scope: 'profile,media',
                    type: 'access',
                  },
                  (error, old_access_tokens) => {
                    if (
                      !error &&
                      old_access_tokens &&
                      old_access_tokens.length > 0
                    ) {
                      Tokens.deleteOne(old_access_tokens[0], (error) => {
                        if (!error) {
                          let new_token = Tokens({
                            token: auth_response.access_token,
                            type: 'access',
                            time: Date.now(),
                            website: 'instagram.com',
                            expires_in: Date.now() + 5184000000,
                            scope: 'profile,media',
                          });
                          new_token.save((error, new_access_token) => {
                            if (!error && new_access_token) {
                              res.status(200).json({
                                success: true,
                                message: 'Successfully Saved the token in db',
                                expires_in: Date.now() + 5184000000,
                              });
                            } else {
                              res.status(500).json({
                                success: false,
                                error: 'Error saving New Token',
                              });
                            }
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Error Deleting old token',
                          });
                        }
                      });
                    } else {
                      let new_token = Tokens({
                        token: auth_response.access_token,
                        type: 'access',
                        time: Date.now(),
                        website: 'instagram.com',
                        expires_in: Date.now() + 5184000000,
                        scope: 'profile,media',
                      });
                      new_token.save((error, new_access_token) => {
                        if (!error && new_access_token) {
                          res.status(200).json({
                            success: true,
                            message: 'Successfully Saved the token in db',
                            expires_in: Date.now() + 5184000000,
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Error saving New Token',
                          });
                        }
                      });
                    }
                  },
                );
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Error Generating a new token',
                });
              }
            } else {
              let auth_url = get_auth_code_url(client_id.token);
              res.redirect(auth_url);
            }
          } else {
            res.status(500).json({
              success: false,
              error: 'No Access Codes found, Quitting the App.',
            });
          }
        },
      );
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        error,
      });
    });
});

router.use('/media', require('./media'));

module.exports = router;
