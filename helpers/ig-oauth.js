const axios = require('axios');

const auth_server = 'https://api.instagram.com/oauth/access_token';
const auth_long_token_server = 'https://graph.instagram.com/access_token';
const auth_refresh_server = 'https://graph.instagram.com/refresh_access_token';

const db = require('./mongo');
const Tokens = require('../models/tokens');

const get_auth_code_url = (client_id) => {
  const encoded_client_id = encodeURIComponent(client_id);
  const redirect_url = encodeURIComponent('https://127.0.0.1:3000/ig/oauth');
  return `https://api.instagram.com/oauth/authorize?client_id=${encoded_client_id}&response_type=code&redirect_uri=${redirect_url}&scope=user_profile,user_media`;
};

const create_access_token = async (client_id, client_secret, auth_code) => {
  const encoded_client_id = encodeURIComponent(client_id);
  const encoded_client_secret = encodeURIComponent(client_secret);
  const encoded_auth_code = encodeURIComponent(auth_code);
  const redirect_uri = encodeURIComponent('https://127.0.0.1:3000/ig/oauth');
  const access_response = await axios
    .post(
      auth_server,
      `client_id=${encoded_client_id}&client_secret=${encoded_client_secret}&code=${encoded_auth_code}&grant_type=authorization_code&redirect_uri=${redirect_uri}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }
      return {
        success: false,
        data: 'Not Able to Proceed',
      };
    })
    .catch((error) => ({
      success: false,
      data: error,
    }));
  if (access_response.success) {
    return {
      success: true,
      ...access_response.data,
    };
  }
  return {
    success: false,
    error: access_response.data,
  };
};

const gen_long_token = async (client_secret, code) => {
  const encoded_client_secret = encodeURIComponent(client_secret);
  const encoded_auth_code = encodeURIComponent(code);
  const access_response = await axios
    .get(
      `${auth_long_token_server}?client_secret=${encoded_client_secret}&access_token=${encoded_auth_code}&grant_type=ig_exchange_token`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    .then((response) => {
      if (response.status === 200 && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }
      return {
        success: false,
        data: 'Not Able to Proceed',
      };
    })
    .catch((error) => ({
      success: false,
      data: error,
    }));
  if (access_response.success) {
    return {
      success: true,
      ...access_response.data,
    };
  }
  return {
    success: false,
    error: access_response.data,
  };
};

const refresh_token = async (code) => {
  const code_expiry = code.expires_in;
  const threshold_time = code_expiry - 604800000;
  const current_time = Date.now();
  if (current_time > threshold_time) {
    const encoded_code = encodeURIComponent(code.token);
    const url = `${auth_refresh_server}?grant_type=ig_refresh_token&access_token=${encoded_code}`;
    const refresh_token_response = await axios
      .get(url)
      .then((response) => {
        if (response.status === 200 && response.data) {
          return {
            success: true,
            refreshed: true,
            access_token: response.data.access_token,
            expires_in: Date.now() + 5184000000,
            error: null,
          };
        }
        return {
          success: false,
          refreshed: false,
          error: 'Your Request Failed',
        };
      })
      .catch((err) => ({
        success: false,
        refreshed: false,
        error: err,
      }));
    return refresh_token_response;
  }
  return {
    success: true,
    refreshed: false,
    access_token: code.token,
    error: null,
  };
};

const ig_request = (options) => {
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
                options.res.status(404).json({
                  success: false,
                  message: 'Work in Proress',
                });
              } else {
                axios
                  .get(options.url(access_token.token))
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      if (options.keyword === 'posts') {
                        const posts = response.data.data;
                        options.res.status(200).json({
                          success: true,
                          posts,
                        });
                      } else {
                        options.res.status(200).json({
                          success: true,
                          ...response.data,
                        });
                      }
                    } else {
                      options.res.status(500).json({
                        success: false,
                        error:
                          'Error Occured while getting posts from Instagram',
                      });
                    }
                  })
                  .catch((fetch_error) => {
                    options.res.status(500).json({
                      success: false,
                      error: 'Error while getting Posts from Instagram',
                      additional_error: fetch_error.response.data,
                    });
                  });
              }
            } else {
              options.res.status(500).json({
                success: false,
                error: 'Error Occured while refreshing the Token',
              });
            }
          }
        },
      );
    })
    .catch((err) => {
      options.res.status(500).json({
        success: false,
        err,
      });
    });
};

exports.get_auth_code_url = get_auth_code_url;
exports.create_access_token = create_access_token;
exports.gen_long_token = gen_long_token;
exports.refresh_token = refresh_token;
exports.ig_request = ig_request;
