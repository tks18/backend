const express = require('express');

const router = express.Router();

// Local
const db = require('../../helpers/mongo');
const { get_auth_code_url, gen_token } = require('../../helpers/github-oauth');

// Models
const Tokens = require('../../models/tokens');

router.get('/oauth', async (req, res) => {
  db.connect()
    .then(() => {
      Tokens.findOne(
        {
          type: 'client_details',
          website: 'github.com',
          scope: 'read:user,read:discussion,read:packages,public_repo',
        },
        async (error, client_details) => {
          if (!error && client_details) {
            const client_secret = client_details;
            const client_id = client_details.additional_tokens.filter(
              (token) => token.type === 'client_id',
            )[0];
            if (req.query && req.query.code) {
              const token_response = await gen_token(
                client_id.token,
                client_secret.token,
                req.query.code,
              );
              if (token_response.success) {
                Tokens.find(
                  {
                    type: 'access',
                    website: 'github.com',
                    scope:
                      'read:user,read:discussion,read:packages,public_repo',
                  },
                  (doc_error, old_access_token) => {
                    if (
                      !doc_error &&
                      old_access_token &&
                      old_access_token.length > 0
                    ) {
                      Tokens.deleteOne(old_access_token[0], (del_error) => {
                        if (!del_error) {
                          const new_access_token = Tokens({
                            token: token_response.access_token,
                            type: 'access',
                            time: Date.now(),
                            website: 'github.com',
                            expires_in: 4773482617000,
                            scope:
                              'read:user,read:discussion,read:packages,public_repo',
                          });
                          new_access_token.save((save_error, new_token) => {
                            if (!save_error && new_token) {
                              res.status(200).json({
                                success: true,
                                message: 'Successfully Saved new Access token',
                                website: new_token.website,
                                expires_in: new_token.expires_in,
                              });
                            } else {
                              res.status(500).json({
                                success: false,
                                error: 'Error while Saving the New Token',
                                additional_error: save_error,
                              });
                            }
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Not ablt to Delete Old Tokens',
                            additional_error: del_error,
                          });
                        }
                      });
                    } else {
                      const new_access_token = Tokens({
                        token: token_response.access_token,
                        type: 'access',
                        time: Date.now(),
                        website: 'github.com',
                        expires_in: 4773482617000,
                        scope:
                          'read:user,read:discussion,read:packages,public_repo',
                      });
                      new_access_token.save((save_error, new_token) => {
                        if (!error && new_token) {
                          res.status(200).json({
                            success: true,
                            message: 'Successfully Saved new Access token',
                            website: new_token.website,
                            expires_in: new_token.expires_in,
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Error while Saving the New Token',
                            additional_error: save_error,
                          });
                        }
                      });
                    }
                  },
                );
              } else {
                res.status(500).json({
                  success: false,
                  error: token_response.error,
                });
              }
            } else {
              const oauth_url = get_auth_code_url(client_id.token);
              res.redirect(oauth_url);
            }
          } else {
            res.status(500).json({
              success: false,
              error: 'Cant Fetch Client Details',
              additional_error: error,
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

router.use('/repo', require('./repo'));

module.exports = router;
