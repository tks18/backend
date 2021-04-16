const express = require('express');

const router = express.Router();
const axios = require('axios');

// Local
const { gen_token, check_token } = require('../../../helpers/google-oauth');
const db = require('../../../helpers/mongo');
const origin_check = require('../../../helpers/checkOrigin');

// Model
const Tokens = require('../../../models/tokens');

const youtube_base_api = 'https://youtube.googleapis.com/youtube/v3/';
const youtube_api_paths = {
  my_videos: {
    url: (part, maxResults) =>
      `${youtube_base_api}search?part=${part}&forMine=true&maxResults=${maxResults}&type=video`,
    headers: (token) => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    }),
  },
  channel_data: {
    url: (channel_id) =>
      `${youtube_base_api}channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channel_id}`,
    headers: (token) => ({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    }),
  },
};

router.post('/videos', async (req, res) => {
  if (origin_check(req.headers.origin)) {
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
                            new_access_token.save(
                              async (save_error, access_token) => {
                                if (!save_error && access_token) {
                                  axios
                                    .get(
                                      youtube_api_paths.my_videos.url(
                                        'snippet',
                                        25,
                                      ),
                                      {
                                        headers: youtube_api_paths.my_videos.headers(
                                          access_token.token,
                                        ),
                                      },
                                    )
                                    .then((response) => {
                                      if (
                                        response.status === 200 &&
                                        response.data
                                      ) {
                                        res.status(200).json({
                                          success: true,
                                          error: null,
                                          data: response.data,
                                        });
                                      } else {
                                        res.status(500).json({
                                          success: false,
                                          error:
                                            'Error While Fetching Youtube Response',
                                          data: null,
                                        });
                                      }
                                    })
                                    .catch((error) => {
                                      res.status(500).json({
                                        success: false,
                                        error,
                                        data: null,
                                      });
                                    });
                                } else {
                                  res.status(500).json({
                                    success: false,
                                    error: 'Error while Saving the New Token',
                                  });
                                }
                              },
                            );
                          } else {
                            res.status(500).json({
                              success: false,
                              error: 'Access Token Integrity Failed',
                            });
                          }
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Error While Generating Access Token',
                          });
                        }
                      } else {
                        res.status(500).json({
                          success: false,
                          error:
                            "Couldn't Find Refresh Token to Generate Access Token",
                        });
                      }
                    } else {
                      res.status(500).json({
                        success: false,
                        error:
                          "Couldn't Find Refresh Token to Generate Access Token",
                      });
                    }
                  });
              } else {
                const old_access_token = access_tokens[0];
                const current_time = Date.now();
                if (current_time > old_access_token.expires_in) {
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
                                          .get(
                                            youtube_api_paths.my_videos.url(
                                              'snippet',
                                              25,
                                            ),
                                            {
                                              headers: youtube_api_paths.my_videos.headers(
                                                access_token.token,
                                              ),
                                            },
                                          )
                                          .then((response) => {
                                            if (
                                              response.status === 200 &&
                                              response.data
                                            ) {
                                              res.status(200).json({
                                                success: true,
                                                error: null,
                                                data: response.data,
                                              });
                                            } else {
                                              res.status(500).json({
                                                success: false,
                                                error:
                                                  'Error While Fetching Youtube Response',
                                                data: null,
                                              });
                                            }
                                          })
                                          .catch((fetch_error) => {
                                            res.status(500).json({
                                              success: false,
                                              error: fetch_error,
                                              data: null,
                                            });
                                          });
                                      } else {
                                        res.status(500).json({
                                          success: false,
                                          error:
                                            'Error while Saving the New Token',
                                        });
                                      }
                                    },
                                  );
                                } else {
                                  res.status(500).json({
                                    success: false,
                                    error: 'Access Token Integrity Failed',
                                  });
                                }
                              } else {
                                res.status(500).json({
                                  success: false,
                                  error: 'Error While Generating Access Token',
                                });
                              }
                            } else {
                              res.status(500).json({
                                success: false,
                                error:
                                  "Couldn't Find Refresh Token to Generate Access Token",
                              });
                            }
                          } else {
                            res.status(500).json({
                              success: false,
                              error:
                                "Couldn't Find Refresh Token to Generate Access Token",
                            });
                          }
                        });
                    } else {
                      res.status(500).json({
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
                      .get(youtube_api_paths.my_videos.url('snippet', 25), {
                        headers: youtube_api_paths.my_videos.headers(
                          old_access_token.token,
                        ),
                      })
                      .then((response) => {
                        if (response.status === 200 && response.data) {
                          res.status(200).json({
                            success: true,
                            error: null,
                            data: response.data,
                          });
                        } else {
                          res.status(500).json({
                            success: false,
                            error: 'Error While Fetching Youtube Response',
                            data: null,
                          });
                        }
                      })
                      .catch((error) => {
                        res.status(500).json({
                          success: false,
                          error,
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
                                            .get(
                                              youtube_api_paths.my_videos.url(
                                                'snippet',
                                                25,
                                              ),
                                              {
                                                headers: youtube_api_paths.my_videos.headers(
                                                  access_token.token,
                                                ),
                                              },
                                            )
                                            .then((response) => {
                                              if (
                                                response.status === 200 &&
                                                response.data
                                              ) {
                                                res.status(200).json({
                                                  success: true,
                                                  error: null,
                                                  data: response.data,
                                                });
                                              } else {
                                                res.status(500).json({
                                                  success: false,
                                                  error:
                                                    'Error While Fetching Youtube Response',
                                                  data: null,
                                                });
                                              }
                                            })
                                            .catch((fetch_error) => {
                                              res.status(500).json({
                                                success: false,
                                                error: fetch_error,
                                                data: null,
                                              });
                                            });
                                        } else {
                                          res.status(500).json({
                                            success: false,
                                            error:
                                              'Error while Saving the New Token',
                                          });
                                        }
                                      },
                                    );
                                  } else {
                                    res.status(500).json({
                                      success: false,
                                      error: 'Access Token Integrity Failed',
                                    });
                                  }
                                } else {
                                  res.status(500).json({
                                    success: false,
                                    error:
                                      'Error While Generating Access Token',
                                  });
                                }
                              } else {
                                res.status(500).json({
                                  success: false,
                                  error:
                                    "Couldn't Find Refresh Token to Generate Access Token",
                                });
                              }
                            } else {
                              res.status(500).json({
                                success: false,
                                error:
                                  "Couldn't Find Refresh Token to Generate Access Token",
                              });
                            }
                          });
                      } else {
                        res.status(500).json({
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
              res.status(500).json({
                success: false,
                error: 'Internal Server Error',
              });
            }
          });
      })
      .catch((err) => {
        res.status(500).json({
          success: false,
          error: err,
        });
      });
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/channel-data', async (req, res) => {
  if (origin_check(req.headers.origin)) {
    const { channel_id } = req.body;
    if (channel_id) {
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
                              new_access_token.save(
                                async (error, access_token) => {
                                  if (!error && access_token) {
                                    axios
                                      .get(
                                        youtube_api_paths.channel_data.url(
                                          channel_id,
                                        ),
                                        {
                                          headers: youtube_api_paths.channel_data.headers(
                                            access_token.token,
                                          ),
                                        },
                                      )
                                      .then((response) => {
                                        if (
                                          response.status === 200 &&
                                          response.data
                                        ) {
                                          res.status(200).json({
                                            success: true,
                                            error: null,
                                            data: response.data,
                                          });
                                        } else {
                                          res.status(500).json({
                                            success: false,
                                            error:
                                              'Error While Fetching Youtube Response',
                                            data: null,
                                          });
                                        }
                                      })
                                      .catch((fetch_error) => {
                                        res.status(500).json({
                                          success: false,
                                          error: fetch_error,
                                          data: null,
                                        });
                                      });
                                  } else {
                                    res.status(500).json({
                                      success: false,
                                      error: 'Error while Saving the New Token',
                                    });
                                  }
                                },
                              );
                            } else {
                              res.status(500).json({
                                success: false,
                                error: 'Access Token Integrity Failed',
                              });
                            }
                          } else {
                            res.status(500).json({
                              success: false,
                              error: 'Error While Generating Access Token',
                            });
                          }
                        } else {
                          res.status(500).json({
                            success: false,
                            error:
                              "Couldn't Find Refresh Token to Generate Access Token",
                          });
                        }
                      } else {
                        res.status(500).json({
                          success: false,
                          error:
                            "Couldn't Find Refresh Token to Generate Access Token",
                        });
                      }
                    });
                } else {
                  const old_access_token = access_tokens[0];
                  const current_time = Date.now();
                  if (current_time > old_access_token.expires_in) {
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
                                            .get(
                                              youtube_api_paths.channel_data.url(
                                                channel_id,
                                              ),
                                              {
                                                headers: youtube_api_paths.channel_data.headers(
                                                  access_token.token,
                                                ),
                                              },
                                            )
                                            .then((response) => {
                                              if (
                                                response.status === 200 &&
                                                response.data
                                              ) {
                                                res.status(200).json({
                                                  success: true,
                                                  error: null,
                                                  data: response.data,
                                                });
                                              } else {
                                                res.status(500).json({
                                                  success: false,
                                                  error:
                                                    'Error While Fetching Youtube Response',
                                                  data: null,
                                                });
                                              }
                                            })
                                            .catch((fetch_error) => {
                                              res.status(500).json({
                                                success: false,
                                                error: fetch_error,
                                                data: null,
                                              });
                                            });
                                        } else {
                                          res.status(500).json({
                                            success: false,
                                            error:
                                              'Error while Saving the New Token',
                                          });
                                        }
                                      },
                                    );
                                  } else {
                                    res.status(500).json({
                                      success: false,
                                      error: 'Access Token Integrity Failed',
                                    });
                                  }
                                } else {
                                  res.status(500).json({
                                    success: false,
                                    error:
                                      'Error While Generating Access Token',
                                  });
                                }
                              } else {
                                res.status(500).json({
                                  success: false,
                                  error:
                                    "Couldn't Find Refresh Token to Generate Access Token",
                                });
                              }
                            } else {
                              res.status(500).json({
                                success: false,
                                error:
                                  "Couldn't Find Refresh Token to Generate Access Token",
                              });
                            }
                          });
                      } else {
                        res.status(500).json({
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
                        .get(youtube_api_paths.channel_data.url(channel_id), {
                          headers: youtube_api_paths.channel_data.headers(
                            old_access_token.token,
                          ),
                        })
                        .then((response) => {
                          if (response.status === 200 && response.data) {
                            res.status(200).json({
                              success: true,
                              error: null,
                              data: response.data,
                            });
                          } else {
                            res.status(500).json({
                              success: false,
                              error: 'Error While Fetching Youtube Response',
                              data: null,
                            });
                          }
                        })
                        .catch((fetch_error) => {
                          res.status(500).json({
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
                                              .get(
                                                youtube_api_paths.channel_data.url(
                                                  channel_id,
                                                ),
                                                {
                                                  headers: youtube_api_paths.channel_data.headers(
                                                    access_token.token,
                                                  ),
                                                },
                                              )
                                              .then((response) => {
                                                if (
                                                  response.status === 200 &&
                                                  response.data
                                                ) {
                                                  res.status(200).json({
                                                    success: true,
                                                    error: null,
                                                    data: response.data,
                                                  });
                                                } else {
                                                  res.status(500).json({
                                                    success: false,
                                                    error:
                                                      'Error While Fetching Youtube Response',
                                                    data: null,
                                                  });
                                                }
                                              })
                                              .catch((fetch_error) => {
                                                res.status(500).json({
                                                  success: false,
                                                  error: fetch_error,
                                                  data: null,
                                                });
                                              });
                                          } else {
                                            res.status(500).json({
                                              success: false,
                                              error:
                                                'Error while Saving the New Token',
                                            });
                                          }
                                        },
                                      );
                                    } else {
                                      res.status(500).json({
                                        success: false,
                                        error: 'Access Token Integrity Failed',
                                      });
                                    }
                                  } else {
                                    res.status(500).json({
                                      success: false,
                                      error:
                                        'Error While Generating Access Token',
                                    });
                                  }
                                } else {
                                  res.status(500).json({
                                    success: false,
                                    error:
                                      "Couldn't Find Refresh Token to Generate Access Token",
                                  });
                                }
                              } else {
                                res.status(500).json({
                                  success: false,
                                  error:
                                    "Couldn't Find Refresh Token to Generate Access Token",
                                });
                              }
                            });
                        } else {
                          res.status(500).json({
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
                res.status(500).json({
                  success: false,
                  error: 'Internal Server Error',
                });
              }
            });
        })
        .catch((err) => {
          res.status(500).json({
            success: false,
            error: err,
          });
        });
    } else {
      res.status(401).json({
        success: false,
        message:
          'channelid - Required Param - Not Present. Rejecting the Request',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

module.exports = router;
