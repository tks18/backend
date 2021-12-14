const express = require('express');

const router = express.Router();

// Local
const db = require('../../helpers/mongo');
const jwtverify = require('../../middleware/jwtverify');

// Models
const Stories = require('../../models/stories');

const website = 'https://webstories.sudharshan.tk';

router.post('/get', (req, res) => {
  db.connect()
    .then(() => {
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
        db.close();
      });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
      db.close();
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
          db.close();
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Story Validation Failed',
        });
        db.close();
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
      db.close();
    });
});

module.exports = router;
