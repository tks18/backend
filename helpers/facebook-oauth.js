const axios = require('axios');
const auth_server = 'https://graph.facebook.com/v10.0/oauth/access_token';
const auth_checking_server = 'https://graph.facebook.com/debug_token';

exports.get_auth_code_url = (client_id) => {
  let encoded_client_id = encodeURIComponent(client_id);
  let redirect_url = encodeURIComponent(
    'https://127.0.0.1:3000/facebook/oauth',
  );
  return `https://www.facebook.com/v10.0/dialog/oauth?client_id=${encoded_client_id}&response_type=code&redirect_uri=${redirect_url}&scope=pages_show_list,instagram_basic,instagram_manage_insights,instagram_content_publish`;
};

exports.gen_token = async (client_id, client_secret, auth_code) => {
  let encoded_client_id = encodeURIComponent(client_id);
  let encoded_client_secret = encodeURIComponent(client_secret);
  let encoded_auth_code = encodeURIComponent(auth_code);
  let redirect_uri = encodeURIComponent(
    'https://127.0.0.1:3000/facebook/oauth',
  );
  let access_url = `${auth_server}?client_id=${encoded_client_id}&redirect_uri=${redirect_uri}&client_secret=${encoded_client_secret}&code=${encoded_auth_code}`;
  let access_response = await axios
    .get(access_url)
    .then((response) => {
      if (response.status == 200 && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          data: 'Not Able to Proceed',
        };
      }
    })
    .catch((error) => {
      console.log(error.response);
      return {
        success: false,
        data: error,
      };
    });
  if (access_response.success) {
    return {
      success: true,
      ...access_response.data,
    };
  } else {
    return {
      success: false,
      error: access_response.data,
    };
  }
};
