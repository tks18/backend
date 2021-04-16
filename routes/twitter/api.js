const base_url = 'https://api.twitter.com';

const api = {
  users: {
    tweets: (id) =>
      `${base_url}/2/users/${id}/tweets?expansions=attachments.media_keys,author_id,entities.mentions.username,referenced_tweets.id,referenced_tweets.id.author_id&tweet.fields=attachments,author_id,conversation_id,created_at,entities,id,lang,referenced_tweets,source,text,withheld&user.fields=created_at,description,entities,id,name,profile_image_url,url,username&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width&max_results=10`,
  },
};

module.exports = api;
