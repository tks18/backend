const axios = require('axios');
const express = require('express');

const router = express.Router();

// Local
const db = require('../../helpers/mongo');
const api = require('./api');

// Models
const Tokens = require('../../models/tokens');

router.post('/tweets', (req, res) => {
  db.connect()
    .then(() => {
      Tokens.findOne(
        {
          type: 'all_details',
          website: 'twitter.com',
          scope: 'read_user,read_tweets',
        },
        (_error, access_token) => {
          const user_id = access_token.additional_tokens.filter(
            (token) => token.type === 'user_id',
          )[0];
          axios
            .get(api.users.tweets(user_id.token), {
              headers: {
                Authorization: `Bearer ${access_token.token}`,
              },
            })
            .then((resp) => {
              res.json(resp.data);
            })
            .catch((e) => {
              res.json(e.response.data);
            });
        },
      );
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        error,
      });
    });
});

module.exports = router;
