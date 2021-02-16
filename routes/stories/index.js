const express = require('express');
const router = express.Router();
const db = require('../../helpers/mongo');
const originCheck = require('../../helpers/checkOrigin');
const jwtverify = require('../../helpers/jwtVerify');

const website = 'https://webstories.shaaan.tk';

//Models
const Stories = require('../../models/stories');

router.post('/get', (req, res) => {
  if (originCheck(req.headers.origin)) {
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
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/set', (req, res) => {
  if (originCheck(req.headers.origin)) {
    let token = req.headers.token;
    if (jwtverify(token)) {
      db.connect()
        .then(() => {
          let story = req.body.story;
          if (story) {
            let newStory = new Stories(story);
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
              error,
            });
            db.close();
          }
        })
        .catch((error) => {
          res.status(500).json({ success: false, message: error });
          db.close();
        });
    } else {
      res.status(401).json({
        success: false,
        message: 'Forbidden, Your Pass is Wrong',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

module.exports = router;
