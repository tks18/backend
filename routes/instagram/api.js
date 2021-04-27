const baseurl = 'https://graph.instagram.com/';
const api = {
  media: (token) =>
    `${baseurl}me/media?limit=35&fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${token}`,
  profile: (token) =>
    `${baseurl}me?fields=id,username,account_type,media_count&access_token=${token}`,
};

module.exports = api;
