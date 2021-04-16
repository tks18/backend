const axios = require('axios');

const auth_server = 'https://api.instagram.com/oauth/access_token';
const auth_long_token_server = 'https://graph.instagram.com/access_token';
const auth_refresh_server = 'https://graph.instagram.com/refresh_access_token';

exports.get_auth_code_url = (client_id) => {
  const encoded_client_id = encodeURIComponent(client_id);
  const redirect_url = encodeURIComponent('https://127.0.0.1:3000/ig/oauth');
  return `https://api.instagram.com/oauth/authorize?client_id=${encoded_client_id}&response_type=code&redirect_uri=${redirect_url}&scope=user_profile,user_media`;
};

exports.create_access_token = async (client_id, client_secret, auth_code) => {
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

exports.gen_long_token = async (client_secret, code) => {
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

exports.refresh_token = async (code) => {
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
