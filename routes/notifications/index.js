const express = require('express');

const router = express.Router();
const db = require('../../helpers/mongo');
const jwtverify = require('../../middleware/jwtverify');

// Model
const Notification = require('../../models/notifications');

router.post('/get', (req, res) => {
  db.connect()
    .then(() => {
      Notification.find({}, (error, docs) => {
        if (docs && !error) {
          const reqType = req.body.type;
          if (reqType && reqType === 'all') {
            res.status(200).json({
              success: true,
              message: 'Fetched Notifications',
              notifications: docs,
            });
          } else {
            const validPosts = [];
            docs.forEach((notification) => {
              const currentTime = Date.now();
              const startStamp = new Date(notification.start);
              const endStamp = new Date(notification.end);
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
});

router.post('/set', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const notify = req.body.notification;
      const startStamp = req.body.startDate;
      const endStamp = req.body.endDate;
      if (notify && startStamp && endStamp) {
        const newNotification = new Notification({
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
});

router.post('/delete', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const delType = req.body.type;
      if (delType && delType === 'single') {
        const notifyId = req.body.id;
        if (notifyId) {
          Notification.deleteOne({ _id: notifyId }, (error) => {
            if (!error) {
              res.status(200).json({
                success: true,
                message: `Successfully Deleted Notification id ${notifyId}`,
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
});

module.exports = router;
