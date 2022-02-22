const express = require('express');

const router = express.Router();
const db = require('../../helpers/mongo');
const jwtverify = require('../../middleware/jwtverify');

// Models
const Blog = require('../../models/blog');

router.post('/get', (req, res) => {
  db.connect()
    .then(() => {
      const { type } = req.body;
      if (type && type.toLowerCase() === 'single') {
        const { id } = req.body;
        Blog.findOne({ _id: id }, (error, post) => {
          if (!error) {
            res.status(200).json({ success: true, post });
          } else {
            res.status(404).json({
              success: false,
              message: 'Error Finding Post',
              error,
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
              error,
            });
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
    });
});

router.post('/set', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const { post } = req.body;
      if (post) {
        const newBlogPost = new Blog(post);
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
});

router.post('/update', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const origpost = req.body.post;
      const { id } = req.body;
      if (origpost && id) {
        Blog.findOne({ _id: id }, (doc_error, post) => {
          if (!doc_error && post) {
            Blog.deleteOne({ _id: id }, (del_error) => {
              if (!del_error) {
                const newBlogPost = new Blog(origpost);
                newBlogPost.save((save_error, doc) => {
                  if (!save_error && doc) {
                    res.status(200).json({
                      success: true,
                      message: 'Successfully Updated',
                    });
                  } else {
                    res.status(500).json({
                      success: false,
                      message: 'Failed to Update Post',
                      save_error,
                    });
                  }
                });
              } else {
                res.status(500).json({
                  success: false,
                  message: 'Failed to get Post',
                  del_error,
                });
              }
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'No Post Found to Update',
              doc_error,
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
});

router.post('/delete', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const { id } = req.body;
      if (id) {
        Blog.findOne({ _id: id }, (doc_error, doc) => {
          if (!doc_error && doc) {
            Blog.deleteOne({ _id: id }, (del_error) => {
              if (!del_error) {
                res.status(200).json({
                  success: true,
                  message: 'Successfully Deleted',
                });
              } else {
                res.status(500).json({
                  success: false,
                  message: 'Error While Deleting the Post',
                  del_error,
                });
              }
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'No Post Found With Your ID',
              doc_error,
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
});

module.exports = router;
