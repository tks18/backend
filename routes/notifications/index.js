const express = require('express');
const router = express.Router();
const originCheck = require('../../helpers/checkOrigin');
const db = require('../../helpers/mongo');
const jwtverify = require('../../helpers/jwtVerify');

// Model
const Notification = require('../../models/notifications');

router.post('/get', (req, res) => {
  if (originCheck(req.headers.origin)) {
    db.connect()
      .then(() => {
        Notification.find({}, (error, docs) => {
          if (docs && !error) {
            let reqType = req.body.type;
            if (reqType && reqType == 'all') {
              res.status(200).json({
                success: true,
                message: 'Fetched Notifications',
                notifications: docs,
              });
            } else {
              let validPosts = [];
              docs.forEach((notification) => {
                let currentTime = Date.now();
                let startStamp = new Date(notification.start);
                let endStamp = new Date(notification.end);
                if (currentTime < endStamp && currentTime > startStamp) {
                  validPosts.push(notification);
                }
              });
              res.status(200).json({
                success: true,
                message: 'Fetched Notifications',
                notifications: validPosts,
              });
            }
          } else {
            res.status(500).json({
              success: false,
              error,
              message: 'Error While getting Details. Server Error',
            });
            db.close();
          }
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
          let notify = req.body.notification;
          let startStamp = req.body.startDate;
          let endStamp = req.body.endDate;
          if (notify && startStamp && endStamp) {
            let newNotification = new Notification({
              start: startStamp,
              end: endStamp,
              properties: notify,
            });
            newNotification.save((error, doc) => {
              if (doc && !error) {
                res.status(200).json({
                  success: true,
                  doc,
                  message: 'Successfully saved the Notification Details',
                });
                db.close();
              } else {
                res.status(500).json({
                  success: false,
                  error,
                  message: 'Error While Saving Details. Validation Failed',
                });
                db.close();
              }
            });
          } else {
            res.status(401).json({
              success: false,
              message: 'Required Details Not Sent',
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

router.post('/delete', (req, res) => {
  if (originCheck(req.headers.origin)) {
    let token = req.headers.token;
    if (jwtverify(token)) {
      db.connect()
        .then(() => {
          let delType = req.body.type;
          if (delType && delType == 'single') {
            let notifyId = req.body.id;
            if (notifyId) {
              Notification.deleteOne({ _id: notifyId }, (error) => {
                if (!error) {
                  res.status(200).json({
                    success: true,
                    message: 'Successfully Deleted Notification id ' + notifyId,
                  });
                } else {
                  res.status(500).json({
                    success: false,
                    message: 'Error Deleting the Notification',
                    error,
                  });
                }
              });
            } else {
              res.status(401).json({
                success: false,
                message: 'Required Details Not Sent',
              });
              db.close();
            }
          } else {
            Notification.deleteMany({}, (error) => {
              if (!error) {
                res.status(200).json({
                  success: true,
                  message: 'Successfully Deleted all Notifications',
                });
              } else {
                res.status(500).json({
                  success: false,
                  message: 'Error Deleting the Notifications',
                  error,
                });
              }
            });
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
