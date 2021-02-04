const express = require('express');
const router = express.Router();
const originCheck = require('../../helpers/checkOrigin');
const db = require('../../helpers/mongo');

//model
const Blog = require('../../models/blog');

router.post('/get', (req, res) => {
  if (originCheck(req.headers.origin)) {
    db.connect()
      .then(() => {
        let type = req.body.type;
        if (type && type.toLowerCase() == 'single') {
          let id = req.body.id;
          Blog.findOne({ _id: id }, (error, post) => {
            if (!error) {
              res.status(200).json({ success: true, post });
            } else {
              res.status(404).json({
                success: false,
                message: 'Error Finding Post',
                error: error,
              });
            }
          });
        } else {
          Blog.find({}, (error, posts) => {
            if (!error) {
              res.status(200).json({ success: true, posts });
            } else {
              res.status(404).json({
                success: false,
                message: 'Error Finding Posts',
                error: error,
              });
            }
          });
        }
      })
      .catch((error) => {
        res.status(500).json({ success: false, message: error });
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
    let pass = req.body.pass;
    if (pass && pass == process.env.POSTPASS) {
      db.connect()
        .then(() => {
          console.log(req.body);
          let post = req.body.post;
          if (post) {
            let newBlogPost = new Blog(post);
            newBlogPost.save((error, doc) => {
              if (!error) {
                res.status(200).json({
                  success: true,
                  docid: doc.id,
                  message: 'Successfully Saved the Post',
                  post: doc,
                });
              } else {
                res.status(500).json({ success: false, message: error });
              }
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'Post Validation Failed',
            });
          }
        })
        .catch((error) => {
          res.status(500).json({ success: false, message: error });
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

router.post('/update', (req, res) => {
  if (originCheck(req.headers.origin)) {
    let pass = req.body.pass;
    if (pass && pass == process.env.POSTPASS) {
      db.connect()
        .then(() => {
          let origpost = req.body.post;
          let id = req.body.id;
          if (origpost && id) {
            Blog.findOne({ _id: id }, (error, post) => {
              if (!error && post) {
                Blog.deleteOne({ _id: id }, (error) => {
                  if (!error) {
                    let newBlogPost = new Blog(origpost);
                    newBlogPost.save((error, doc) => {
                      if (!error && doc) {
                        res.status(200).json({
                          success: true,
                          message: 'Successfully Updated',
                        });
                      } else {
                        res.status(500).json({
                          success: false,
                          message: 'Failed to Update Post',
                          error: error,
                        });
                      }
                    });
                  } else {
                    res.status(500).json({
                      success: false,
                      message: 'Failed to get Post',
                      error: error,
                    });
                  }
                });
              } else {
                res.status(404).json({
                  success: false,
                  message: 'No Post Found to Update',
                  error: error,
                });
              }
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'No Post Found to Update',
            });
          }
        })
        .catch((error) => {
          res.status(500).json({ success: false, message: error });
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
    let pass = req.body.pass;
    if (pass && pass == process.env.POSTPASS) {
      db.connect()
        .then(() => {
          let id = req.body.id;
          if (id) {
            Blog.findOne({ _id: id }, (error, doc) => {
              if (!error && doc) {
                Blog.deleteOne({ _id: id }, (error) => {
                  if (!error) {
                    res.status(200).json({
                      success: true,
                      message: 'Successfully Deleted',
                    });
                  } else {
                    res.status(500).json({
                      success: false,
                      message: 'Error While Deleting the Post',
                      error: error,
                    });
                  }
                });
              } else {
                res.status(404).json({
                  success: false,
                  message: 'No Post Found With Your ID',
                  error: error,
                });
              }
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'No ID Found in Your Reqs',
            });
          }
        })
        .catch((error) => {
          res.status(500).json({ success: false, message: error });
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
