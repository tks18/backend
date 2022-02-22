const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../helpers/mongo');
const jwtverify = require('../../middleware/jwtverify');

// Model
const Author = require('../../models/author');

router.post('/set', jwtverify, (req, res) => {
  db.connect()
    .then(() => {
      const { author } = req.body;
      if (author.email) {
        Author.findOne({ email: author.email }, (doc_error, foundAuthor) => {
          if (!doc_error && foundAuthor == null && author.password) {
            bcrypt.hash(author.password, 11, (hash_error, hashedPass) => {
              if (!hash_error && hashedPass) {
                const newAuthor = new Author({
                  name: author.name,
                  email: author.email,
                  github: author.github,
                  password: hashedPass,
                });
                newAuthor.save((error, doc) => {
                  if (!error && doc) {
                    res.status(200).json({
                      success: true,
                      message: 'Succesfully Added Author',
                      doc,
                    });
                  } else {
                    res.status(500).json({
                      success: false,
                      error,
                      message:
                        'Error While Saving the Document, Please Try Again Later',
                    });
                  }
                });
              } else {
                res.status(500).json({
                  success: false,
                  message: 'Error While Generating Hash',
                });
              }
            });
          } else {
            res.status(404).json({
              success: false,
              message: 'User is Already There',
            });
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Enter a Proper Email Id.',
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: error });
    });
});

router.post('/sign', (req, res) => {
  const { creds } = req.body;
  if (creds && creds.email && creds.password) {
    db.connect()
      .then(() => {
        Author.findOne({ email: creds.email }, (doc_error, auth) => {
          if (!doc_error && auth) {
            bcrypt.compare(
              creds.password,
              auth.password,
              (hash_error, passedTest) => {
                if (!hash_error && passedTest) {
                  jwt.sign(
                    { auth },
                    process.env.HASHPASS,
                    { expiresIn: 31536000 },
                    (sign_error, token) => {
                      if (!sign_error && token) {
                        res.status(200).json({
                          success: true,
                          token,
                          author: auth,
                        });
                      } else {
                        res.status(500).json({
                          success: false,
                          sign_error,
                          message: 'Generation of Web Token Failed',
                        });
                      }
                    },
                  );
                } else {
                  res.status(401).json({
                    success: false,
                    hash_error,
                    message: 'Enter the Password Correctly',
                  });
                }
              },
            );
          } else {
            res.status(404).json({
              success: false,
              doc_error,
              message: 'Unable to Find the Author with the Email',
            });
          }
        });
      })
      .catch((error) => {
        res.status(403).json({
          success: false,
          message: 'Server Error',
          error,
        });
      });
  } else {
    res.status(401).json({
      success: false,
      message: 'Please Enter Mandatory Details',
    });
  }
});

module.exports = router;
