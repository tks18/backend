const express = require('express');

const router = express.Router();

// Local
const db = require('../../helpers/mongo');
const {
  get_auth_code_url,
  create_access_token,
  gen_long_token,
} = require('../../helpers/ig-oauth');

// Model
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
            const client_secret = client_details;
            const client_id = client_details.additional_tokens.filter(
              (token) => token.type === 'client_id',
            )[0];
            if (req.query && req.query.code) {
              const auth_code = req.query.code;
              const short_auth_response = await create_access_token(
                client_id.token,
                client_secret.token,
                auth_code,
              );
              if (short_auth_response.success) {
                const exchange_response = await gen_long_token(
                  client_secret.token,
                  short_auth_response.access_token,
                );
                if (exchange_response.success) {
                  Tokens.find(
                    {
                      website: 'instagram.com',
                      scope: 'profile,media',
                      type: 'access',
                    },
                    (doc_error, old_access_tokens) => {
                      if (
                        !doc_error &&
                        old_access_tokens &&
                        old_access_tokens.length > 0
                      ) {
                        Tokens.deleteOne(old_access_tokens[0], (del_error) => {
                          if (!del_error) {
                            const new_token = Tokens({
                              token: exchange_response.access_token,
                              type: 'access',
                              time: Date.now(),
                              website: 'instagram.com',
                              expires_in: Date.now() + 5184000000,
                              scope: 'profile,media',
                            });
                            new_token.save((save_error, new_access_token) => {
                              if (!save_error && new_access_token) {
                                res.status(200).json({
                                  success: true,
                                  message: 'Successfully Saved the token in db',
                                  expires_in: new_access_token.expires_in,
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
                        const new_token = Tokens({
                          token: exchange_response.access_token,
                          type: 'access',
                          time: Date.now(),
                          website: 'instagram.com',
                          expires_in: Date.now() + 5184000000,
                          scope: 'profile,media',
                        });
                        new_token.save((save_error, new_access_token) => {
                          if (!save_error && new_access_token) {
                            res.status(200).json({
                              success: true,
                              message: 'Successfully Saved the token in db',
                              expires_in: new_access_token.expires_in,
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
                    error: 'Error Exchanging the Auth token',
                  });
                }
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Error Generating a new token',
                });
              }
            } else {
              const auth_url = get_auth_code_url(client_id.token);
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

router.use('/profile', require('./profile'));
router.use('/media', require('./media'));

module.exports = router;
