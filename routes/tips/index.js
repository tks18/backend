const express = require('express');

const router = express.Router();
const db = require('../../helpers/mongo');
const jwtverify = require('../../middleware/jwtverify');

// Model
const Tips = require('../../models/tips');

router.post('/get', (req, res) => {
  db.connect()
    .then(() => {
      Tips.find({}, (error, docs) => {
        if (!error && docs) {
          const getType = req.body.type;
          if (getType && getType === 'notification') {
            const randomTip = docs[Math.floor(Math.random() * docs.length)];
            res.status(200).json({
              success: true,
              message: 'Fetched a Random Tip',
              tip: randomTip,
            });
          } else if (getType && getType === 'other') {
            const randomTip = docs[Math.floor(Math.random() * docs.length)];
            res.status(200).json({
              success: true,
              message: 'Fetched a Random Tip',
              tip: {
                title: randomTip.title,
                subtitle: randomTip.subtitle,
                type: randomTip.type,
                time: randomTip.time,
              },
            });
          } else if (getType && getType === 'all') {
            res.status(200).json({
              success: true,
              message: 'Fetched a Random Tip',
              tips: docs,
            });
          } else {
            res.status(404).json({
              success: false,
              message: "Error ! You Haven't Specified the type of Get Request",
            });
          }
        } else {
          res.status(500).json({
            success: false,
            error,
            message: 'Error While getting Details. Server Error',
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
      const tip = req.body.tipProperties;
      if (tip) {
        const newTip = new Tips({
          time: Date.now(),
          title: tip.title,
          subtitle: tip.subtitle,
          type: tip.data.type,
          notification: tip,
        });
        newTip.save((error, doc) => {
          if (doc && !error) {
            res.status(200).json({
              success: true,
              doc,
              message: 'Successfully saved the Tip Details',
            });
          } else {
            res.status(500).json({
              success: false,
              error,
              message: 'Error While Saving Details. Validation Failed',
            });
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Required Details Not Sent',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
    });
});

module.exports = router;
