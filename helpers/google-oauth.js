const axios = require('axios');
const auth_server = 'https://oauth2.googleapis.com/token';
const auth_checking_server = 'https://oauth2.googleapis.com/tokeninfo';

exports.gen_token = async (client_id, client_sec, refresh_token) => {
  let encoded_cl_id = encodeURIComponent(client_id);
  let encoded_cl_sec = encodeURIComponent(client_sec);
  let encoded_ref_tok = encodeURIComponent(refresh_token);
  let body_part = `client_id=${encoded_cl_id}&client_secret=${encoded_cl_sec}&refresh_token=${encoded_ref_tok}&grant_type=refresh_token`;
  let auth_response = await axios
    .post(auth_server, body_part, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((response) => {
      if (response.status == 200 && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          data: null,
        };
      }
    })
    .catch((error) => {
      return {
        success: false,
        data: error.response.data,
      };
    });
  if (auth_response.success && auth_response.data != null) {
    let current_time = Date.now();
    let expiry_time = current_time + auth_response.data.expires_in * 1000;
    return {
      success: true,
      error: null,
      access_token: auth_response.data.access_token,
      expires_in: expiry_time,
      scope: auth_response.data.scope,
      token_type: auth_response.data.token_type,
    };
  } else {
    return {
      success: false,
      data: null,
      error: auth_response.data,
    };
  }
};

exports.check_token = async (type, access_token) => {
  let encoded_access_token = access_token;
  let body_part = `${type}=${encoded_access_token}`;
  return await axios
    .post(auth_checking_server, body_part, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then((response) => {
      if (response.status == 200 && response.data) {
        return {
          success: true,
          ...response.data,
        };
      } else {
        return {
          success: false,
          error: 'Internal Server Error',
        };
      }
    })
    .catch((error) => {
      console.log(error.response);
      return {
        success: false,
        ...error,
      };
    });
};
