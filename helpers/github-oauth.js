const axios = require('axios');

const auth_server = 'https://github.com/login/oauth/authorize';
const token_server = 'https://github.com/login/oauth/access_token';

const db = require('./mongo');
const Tokens = require('../models/tokens');

const get_auth_code_url = (client_id) => {
  const encoded_client_id = encodeURIComponent(client_id);
  const redirect_url = encodeURIComponent('http://127.0.0.1:3000/github/oauth');
  const scope = encodeURIComponent(
    'read:user,read:discussion,read:packages,public_repo',
  );
  return `${auth_server}?client_id=${encoded_client_id}&redirect_uri=${redirect_url}&login=tks18&scope=${scope}`;
};

const gen_token = async (client_id, client_secret, token) => {
  const encoded_client_id = encodeURIComponent(client_id);
  const encoded_client_secret = encodeURIComponent(client_secret);
  const encrypted_token = encodeURIComponent(token);
  const redirect_url = 'http://127.0.0.1:3000/github/oauth';
  const token_response = await axios
    .post(
      token_server,
      {
        client_id: encoded_client_id,
        client_secret: encoded_client_secret,
        code: encrypted_token,
        redirect_uri: redirect_url,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
          error: null,
        };
      }
      return {
        success: false,
        data: null,
        error: 'Unable to fetch Data',
      };
    })
    .catch((error) => ({
      success: false,
      data: null,
      error,
    }));
  if (token_response.success && !token_response.error) {
    return {
      success: true,
      ...token_response.data,
    };
  }
  return {
    success: false,
    error: token_response.error,
  };
};

const gh_headers = (token) => ({
  Authorization: `token ${token}`,
});

const gh_request = (options) => {
  db.connect()
    .then(() => {
      Tokens.findOne(
        {
          type: 'access',
          website: 'github.com',
          scope: 'read:user,read:discussion,read:packages,public_repo',
        },
        (doc_error, access_token) => {
          if (!doc_error && access_token) {
            const headers = options.special_headers
              ? {
                  ...gh_headers(access_token.token),
                  ...options.special_headers,
                }
              : gh_headers(access_token.token);
            const params =
              options.parameters !== null ? options.parameters : {};
            axios
              .get(options.url, {
                headers,
                params,
              })
              .then((response) => {
                if (response.status === 200 && response.data) {
                  if (options.spread) {
                    options.res.status(200).json({
                      success: true,
                      ...response.data,
                    });
                  } else {
                    options.res.status(200).json({
                      success: true,
                      [options.keyword]: response.data,
                    });
                  }
                } else {
                  options.res.status(500).json({
                    success: false,
                    error: `Not able to fetch ${options.keyword}`,
                  });
                }
              })
              .catch((error) => {
                options.res.status(500).json({
                  success: false,
                  error,
                });
              });
          } else {
            options.res.status(500).json({
              success: false,
              error: 'Unable to fetch Access Token',
              additional_error: doc_error,
            });
          }
        },
      );
    })
    .catch((error) => {
      options.res.status(500).json({
        success: false,
        error,
      });
    });
};

exports.get_auth_code_url = get_auth_code_url;
exports.gen_token = gen_token;
exports.gh_headers = gh_headers;
exports.gh_request = gh_request;
