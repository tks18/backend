const axios = require('axios');

const auth_server = 'https://oauth2.googleapis.com/token';
const auth_checking_server = 'https://oauth2.googleapis.com/tokeninfo';

exports.gen_token = async (client_id, client_sec, refresh_token) => {
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

exports.check_token = async (type, access_token) => {
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
