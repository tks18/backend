const axios = require('axios');
const express = require('express');
const router = express.Router();

//Local
const db = require('../../helpers/mongo');

//Model
const Tokens = require('../../models/tokens');

let baseurl = 'https://graph.instagram.com/';
let api = {
  media: (token) =>
    `${baseurl}me/media?limit=35&fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${token}`,
};

router.post('/', (req, res) => {
  db.connect()
    .then(() => {
      Tokens.findOne(
        {
          website: 'instagram.com',
          scope: 'profile,media',
          type: 'access',
        },
        (error, access_token) => {
          if (!error && access_token) {
            axios.get(api.media(access_token.token)).then((response) => {
              console.log(response);
              res.json(response.data);
            });
          }
        },
      );
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
