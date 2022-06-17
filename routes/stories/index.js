const express = require('express');

const router = express.Router();

// Local
const db = require('../../helpers/mongo');
const jwtverify = require('../../middleware/jwtverify');

// Models
const Stories = require('../../models/stories');

const website = 'https://webstories.sudharshan.dev';

router.post('/get', (req, res) => {
  db.connect()
    .then((dbb) => {
      Stories.find({}, (error, stories) => {
        if (!error && stories) {
          res.status(200).json({
            success: true,
            message: 'Successfully Fetched Stories',
            website,
            stories,
          });
        } else {
          res.status(404).json({
            success: false,
            message: 'Error Searching Posts',
            error,
          });
        }
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
    });
});

router.post('/set', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const { story } = req.body;
      if (story) {
        const newStory = new Stories(story);
        newStory.save((error, savedStory) => {
          if (!error && savedStory) {
            res.status(200).json({
              success: true,
              docid: savedStory.id,
              message: 'Successfully Saved the Story',
              post: savedStory,
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'Story Validation Failed',
              error,
            });
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Story Validation Failed',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
    });
});

module.exports = router;
