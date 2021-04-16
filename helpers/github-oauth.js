const axios = require('axios');

const auth_server = 'https://github.com/login/oauth/authorize';
const token_server = 'https://github.com/login/oauth/access_token';

exports.get_auth_code_url = (client_id) => {
  const encoded_client_id = encodeURIComponent(client_id);
  const redirect_url = encodeURIComponent('http://127.0.0.1:3000/github/oauth');
  const scope = encodeURIComponent(
    'read:user,read:discussion,read:packages,public_repo',
  );
  return `${auth_server}?client_id=${encoded_client_id}&redirect_uri=${redirect_url}&login=tks18&scope=${scope}`;
};

exports.gen_token = async (client_id, client_secret, token) => {
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

exports.gh_headers = (token) => ({
  Authorization: `token ${token}`,
});
