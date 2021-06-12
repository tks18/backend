const axios = require('axios');

const db = require('./mongo');
const Tokens = require('../models/tokens');

const auth_server = 'https://oauth2.googleapis.com/token';
const auth_checking_server = 'https://oauth2.googleapis.com/tokeninfo';

const gen_token = async (client_id, client_sec, refresh_token) => {
  const encoded_cl_id = encodeURIComponent(client_id);
  const encoded_cl_sec = encodeURIComponent(client_sec);
  const encoded_ref_tok = encodeURIComponent(refresh_token);
  const body_part = `client_id=${encoded_cl_id}&client_secret=${encoded_cl_sec}&refresh_token=${encoded_ref_tok}&grant_type=refresh_token`;
  const auth_response = await axios
    .post(auth_server, body_part, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }
      return {
        success: false,
        data: null,
      };
    })
    .catch((error) => ({
      success: false,
      data: error.response.data,
    }));
  if (auth_response.success && auth_response.data != null) {
    const current_time = Date.now();
    const expiry_time = current_time + auth_response.data.expires_in * 1000;
    return {
      success: true,
      error: null,
      access_token: auth_response.data.access_token,
      expires_in: expiry_time,
      scope: auth_response.data.scope,
      token_type: auth_response.data.token_type,
    };
  }
  return {
    success: false,
    data: null,
    error: auth_response.data,
  };
};

const check_token = async (type, access_token) => {
  const encoded_access_token = access_token;
  const body_part = `${type}=${encoded_access_token}`;
  const token_check_response = await axios
    .post(auth_checking_server, body_part, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          success: true,
          ...response.data,
        };
      }
      return {
        success: false,
        error: 'Internal Server Error',
      };
    })
    .catch((error) => ({
      success: false,
      ...error,
    }));
  return token_check_response;
};

const yt_headers = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
});

const yt_request = (options) => {
  db.connect()
    .then(() => {
      Tokens.find({
        website: 'google.com',
        type: 'access',
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
      })
        .sort({ time: -1 })
        .exec(async (doc_error, access_tokens) => {
          if (!doc_error && access_tokens) {
            if (access_tokens.length === 0) {
              Tokens.find({
                website: 'google.com',
                type: 'refresh',
                scope: 'https://www.googleapis.com/auth/youtube.readonly',
              })
                .sort({ time: -1 })
                .exec(async (refresh_error, refresh_tokens) => {
                  if (!refresh_error && refresh_tokens) {
                    if (refresh_tokens.length > 0) {
                      const refresh_token = refresh_tokens[0];
                      const client_id = refresh_token.additional_tokens.filter(
                        (tokens) => tokens.type === 'client_id',
                      )[0];
                      const client_secret = refresh_token.additional_tokens.filter(
                        (tokens) => tokens.type === 'client_secret',
                      )[0];
                      const token_response = await gen_token(
                        client_id.token,
                        client_secret.token,
                        refresh_token.token,
                      );
                      if (token_response.success && !token_response.error) {
                        const token_integrity = await check_token(
                          'access_token',
                          token_response.access_token,
                        );
                        if (token_integrity.success) {
                          const new_access_token = new Tokens({
                            token: token_response.access_token,
                            type: 'access',
                            time: Date.now(),
                            website: 'google.com',
                            expires_in: token_response.expires_in,
                            scope: token_response.scope,
                          });
                          new_access_token.save(async (error, access_token) => {
                            if (!error && access_token) {
                              axios
                                .get(options.url, {
                                  headers: yt_headers(access_token.token),
                                })
                                .then((response) => {
                                  if (
                                    response.status === 200 &&
                                    response.data
                                  ) {
                                    options.res.status(200).json({
                                      success: true,
                                      error: null,
                                      data: response.data,
                                    });
                                  } else {
                                    options.res.status(500).json({
                                      success: false,
                                      error:
                                        'Error While Fetching Youtube Response',
                                      data: null,
                                    });
                                  }
                                })
                                .catch((fetch_error) => {
                                  options.res.status(500).json({
                                    success: false,
                                    error: fetch_error,
                                    data: null,
                                  });
                                });
                            } else {
                              options.res.status(500).json({
                                success: false,
                                error: 'Error while Saving the New Token',
                              });
                            }
                          });
                        } else {
                          options.res.status(500).json({
                            success: false,
                            error: 'Access Token Integrity Failed',
                          });
                        }
                      } else {
                        options.res.status(500).json({
                          success: false,
                          error: 'Error While Generating Access Token',
                        });
                      }
                    } else {
                      options.res.status(500).json({
                        success: false,
                        error:
                          "Couldn't Find Refresh Token to Generate Access Token",
                      });
                    }
                  } else {
                    options.res.status(500).json({
                      success: false,
                      error:
                        "Couldn't Find Refresh Token to Generate Access Token",
                    });
                  }
                });
            } else {
              const current_time = Date.now();
              const valid_tokens = [];
              access_tokens.forEach((token) => {
                if (current_time > token.expires_in) {
                  Tokens.deleteOne(token, (error) => {
                    if (!error) {
                      // eslint-disable-next-line no-console
                      console.log('Successfully Deleted old Token');
                    } else {
                      // eslint-disable-next-line no-console
                      console.log('Failed Deleting old Token');
                    }
                  });
                } else {
                  valid_tokens.push(token);
                }
              });
              const tokens_available = valid_tokens.length > 0;
              const old_access_token = tokens_available
                ? valid_tokens[0]
                : null;
              if (!tokens_available) {
                Tokens.find({
                  website: 'google.com',
                  type: 'refresh',
                  scope: 'https://www.googleapis.com/auth/youtube.readonly',
                })
                  .sort({ time: -1 })
                  .exec(async (err, refresh_tokens) => {
                    if (!err && refresh_tokens) {
                      if (refresh_tokens.length > 0) {
                        const refresh_token = refresh_tokens[0];
                        const client_id = refresh_token.additional_tokens.filter(
                          (tokens) => tokens.type === 'client_id',
                        )[0];
                        const client_secret = refresh_token.additional_tokens.filter(
                          (tokens) => tokens.type === 'client_secret',
                        )[0];
                        const token_response = await gen_token(
                          client_id.token,
                          client_secret.token,
                          refresh_token.token,
                        );
                        if (token_response.success && !token_response.error) {
                          const token_integrity = await check_token(
                            'access_token',
                            token_response.access_token,
                          );
                          if (token_integrity.success) {
                            const new_access_token = new Tokens({
                              token: token_response.access_token,
                              type: 'access',
                              time: Date.now(),
                              website: 'google.com',
                              expires_in: token_response.expires_in,
                              scope: token_response.scope,
                            });
                            new_access_token.save(
                              async (save_error, access_token) => {
                                if (!save_error && access_token) {
                                  axios
                                    .get(options.url, {
                                      headers: yt_headers(access_token.token),
                                    })
                                    .then((response) => {
                                      if (
                                        response.status === 200 &&
                                        response.data
                                      ) {
                                        options.res.status(200).json({
                                          success: true,
                                          error: null,
                                          data: response.data,
                                        });
                                      } else {
                                        options.res.status(500).json({
                                          success: false,
                                          error:
                                            'Error While Fetching Youtube Response',
                                          data: null,
                                        });
                                      }
                                    })
                                    .catch((fetch_error) => {
                                      options.res.status(500).json({
                                        success: false,
                                        error: fetch_error,
                                        data: null,
                                      });
                                    });
                                } else {
                                  options.res.status(500).json({
                                    success: false,
                                    error: 'Error while Saving the New Token',
                                  });
                                }
                              },
                            );
                          } else {
                            options.res.status(500).json({
                              success: false,
                              error: 'Access Token Integrity Failed',
                            });
                          }
                        } else {
                          options.res.status(500).json({
                            success: false,
                            error: 'Error While Generating Access Token',
                          });
                        }
                      } else {
                        options.res.status(500).json({
                          success: false,
                          error:
                            "Couldn't Find Refresh Token to Generate Access Token",
                        });
                      }
                    } else {
                      options.res.status(500).json({
                        success: false,
                        error:
                          "Couldn't Find Refresh Token to Generate Access Token",
                      });
                    }
                  });
              } else if (
                tokens_available &&
                current_time > old_access_token.expires_in
              ) {
                Tokens.deleteOne(old_access_token, (error) => {
                  if (!error) {
                    Tokens.find({
                      website: 'google.com',
                      type: 'refresh',
                      scope: 'https://www.googleapis.com/auth/youtube.readonly',
                    })
                      .sort({ time: -1 })
                      .exec(async (err, refresh_tokens) => {
                        if (!err && refresh_tokens) {
                          if (refresh_tokens.length > 0) {
                            const refresh_token = refresh_tokens[0];
                            const client_id = refresh_token.additional_tokens.filter(
                              (tokens) => tokens.type === 'client_id',
                            )[0];
                            const client_secret = refresh_token.additional_tokens.filter(
                              (tokens) => tokens.type === 'client_secret',
                            )[0];
                            const token_response = await gen_token(
                              client_id.token,
                              client_secret.token,
                              refresh_token.token,
                            );
                            if (
                              token_response.success &&
                              !token_response.error
                            ) {
                              const token_integrity = await check_token(
                                'access_token',
                                token_response.access_token,
                              );
                              if (token_integrity.success) {
                                const new_access_token = new Tokens({
                                  token: token_response.access_token,
                                  type: 'access',
                                  time: Date.now(),
                                  website: 'google.com',
                                  expires_in: token_response.expires_in,
                                  scope: token_response.scope,
                                });
                                new_access_token.save(
                                  async (save_error, access_token) => {
                                    if (!save_error && access_token) {
                                      axios
                                        .get(options.url, {
                                          headers: yt_headers(
                                            access_token.token,
                                          ),
                                        })
                                        .then((response) => {
                                          if (
                                            response.status === 200 &&
                                            response.data
                                          ) {
                                            options.res.status(200).json({
                                              success: true,
                                              error: null,
                                              data: response.data,
                                            });
                                          } else {
                                            options.res.status(500).json({
                                              success: false,
                                              error:
                                                'Error While Fetching Youtube Response',
                                              data: null,
                                            });
                                          }
                                        })
                                        .catch((fetch_error) => {
                                          options.res.status(500).json({
                                            success: false,
                                            error: fetch_error,
                                            data: null,
                                          });
                                        });
                                    } else {
                                      options.res.status(500).json({
                                        success: false,
                                        error:
                                          'Error while Saving the New Token',
                                      });
                                    }
                                  },
                                );
                              } else {
                                options.res.status(500).json({
                                  success: false,
                                  error: 'Access Token Integrity Failed',
                                });
                              }
                            } else {
                              options.res.status(500).json({
                                success: false,
                                error: 'Error While Generating Access Token',
                              });
                            }
                          } else {
                            options.res.status(500).json({
                              success: false,
                              error:
                                "Couldn't Find Refresh Token to Generate Access Token",
                            });
                          }
                        } else {
                          options.res.status(500).json({
                            success: false,
                            error:
                              "Couldn't Find Refresh Token to Generate Access Token",
                          });
                        }
                      });
                  } else {
                    options.res.status(500).json({
                      success: false,
                      error:
                        'Not able to Delete Obsolete Token, Not able to Continue after this.',
                      data: null,
                    });
                  }
                });
              } else {
                const old_token_integrity = await check_token(
                  'access_token',
                  old_access_token.token,
                );
                if (old_token_integrity.success) {
                  axios
                    .get(options.url, {
                      headers: yt_headers(old_access_token.token),
                    })
                    .then((response) => {
                      if (response.status === 200 && response.data) {
                        options.res.status(200).json({
                          success: true,
                          error: null,
                          data: response.data,
                        });
                      } else {
                        options.res.status(500).json({
                          success: false,
                          error: 'Error While Fetching Youtube Response',
                          data: null,
                        });
                      }
                    })
                    .catch((fetch_error) => {
                      options.res.status(500).json({
                        success: false,
                        error: fetch_error,
                        data: null,
                      });
                    });
                } else {
                  Tokens.deleteOne(old_access_token, (error) => {
                    if (!error) {
                      Tokens.find({
                        website: 'google.com',
                        type: 'refresh',
                        scope:
                          'https://www.googleapis.com/auth/youtube.readonly',
                      })
                        .sort({ time: -1 })
                        .exec(async (err, refresh_tokens) => {
                          if (!err && refresh_tokens) {
                            if (refresh_tokens.length > 0) {
                              const refresh_token = refresh_tokens[0];
                              const client_id = refresh_token.additional_tokens.filter(
                                (tokens) => tokens.type === 'client_id',
                              )[0];
                              const client_secret = refresh_token.additional_tokens.filter(
                                (tokens) => tokens.type === 'client_secret',
                              )[0];
                              const token_response = await gen_token(
                                client_id.token,
                                client_secret.token,
                                refresh_token.token,
                              );
                              if (
                                token_response.success &&
                                !token_response.error
                              ) {
                                const token_integrity = await check_token(
                                  'access_token',
                                  token_response.access_token,
                                );
                                if (token_integrity.success) {
                                  const new_access_token = new Tokens({
                                    token: token_response.access_token,
                                    type: 'access',
                                    time: Date.now(),
                                    website: 'google.com',
                                    expires_in: token_response.expires_in,
                                    scope: token_response.scope,
                                  });
                                  new_access_token.save(
                                    async (save_error, access_token) => {
                                      if (!save_error && access_token) {
                                        axios
                                          .get(options.url, {
                                            headers: yt_headers(
                                              access_token.token,
                                            ),
                                          })
                                          .then((response) => {
                                            if (
                                              response.status === 200 &&
                                              response.data
                                            ) {
                                              options.res.status(200).json({
                                                success: true,
                                                error: null,
                                                data: response.data,
                                              });
                                            } else {
                                              options.res.status(500).json({
                                                success: false,
                                                error:
                                                  'Error While Fetching Youtube Response',
                                                data: null,
                                              });
                                            }
                                          })
                                          .catch((fetch_error) => {
                                            options.res.status(500).json({
                                              success: false,
                                              error: fetch_error,
                                              data: null,
                                            });
                                          });
                                      } else {
                                        options.res.status(500).json({
                                          success: false,
                                          error:
                                            'Error while Saving the New Token',
                                        });
                                      }
                                    },
                                  );
                                } else {
                                  options.res.status(500).json({
                                    success: false,
                                    error: 'Access Token Integrity Failed',
                                  });
                                }
                              } else {
                                options.res.status(500).json({
                                  success: false,
                                  error: 'Error While Generating Access Token',
                                });
                              }
                            } else {
                              options.res.status(500).json({
                                success: false,
                                error:
                                  "Couldn't Find Refresh Token to Generate Access Token",
                              });
                            }
                          } else {
                            options.res.status(500).json({
                              success: false,
                              error:
                                "Couldn't Find Refresh Token to Generate Access Token",
                            });
                          }
                        });
                    } else {
                      options.res.status(500).json({
                        success: false,
                        error:
                          'Not able to Delete Obsolete Token, Not able to Continue after this.',
                        data: null,
                      });
                    }
                  });
                }
              }
            }
          } else {
            options.res.status(500).json({
              success: false,
              error: 'Internal Server Error',
            });
          }
        });
    })
    .catch((err) => {
      options.res.status(500).json({
        success: false,
        error: err,
      });
    });
};

exports.yt_headers = yt_headers;
exports.gen_token = gen_token;
exports.check_token = check_token;
exports.yt_request = yt_request;
