const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const originCheck = require('../../helpers/checkOrigin');
const db = require('../../helpers/mongo');

//Model
const Author = require('../../models/author');

router.post('/set', (req, res) => {
  if (originCheck(req.headers.origin)) {
    let pass = req.body.pass;
    if (pass && pass == process.env.POSTPASS) {
      db.connect()
        .then(() => {
          let author = req.body.author;
          if (author.email) {
            Author.findOne({ email: author.email }, (error, foundAuthor) => {
              if (!error && foundAuthor == null && author.password) {
                bcrypt.hash(author.password, 11, (error, hashedPass) => {
                  if (!error && hashedPass) {
                    let newAuthor = new Author({
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
                        db.close();
                      } else {
                        res.status(500).json({
                          success: false,
                          error,
                          message:
                            'Error While Saving the Document, Please Try Again Later',
                        });
                        db.close();
                      }
                    });
                  } else {
                    res.status(500).json({
                      success: false,
                      message: 'Error While Generating Hash',
                    });
                    db.close();
                  }
                });
              } else {
                res.status(404).json({
                  success: false,
                  message: 'User is Already There',
                });
                db.close();
              }
            });
          } else {
            res.status(401).json({
              success: false,
              message: 'Enter a Proper Email Id.',
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

router.post('/sign', (req, res) => {
  if (originCheck(req.headers.origin)) {
    let creds = req.body.creds;
    if (creds && creds.email && creds.password) {
      db.connect()
        .then(() => {
          Author.findOne({ email: creds.email }, (error, auth) => {
            if (!error && auth) {
              bcrypt.compare(
                creds.password,
                auth.password,
                (error, passedTest) => {
                  if (!error && passedTest) {
                    jwt.sign(
                      { auth },
                      process.env.HASHPASS,
                      { expiresIn: 31536000 },
                      (error, token) => {
                        if (!error && token) {
                          res.status(200).json({
                            success: true,
                            token,
                            author: auth,
                          });
                          db.close();
                        } else {
                          res.status(500).json({
                            success: false,
                            error,
                            message: 'Generation of Web Token Failed',
                          });
                          db.close();
                        }
                      },
                    );
                  } else {
                    res.status(401).json({
                      success: false,
                      error,
                      message: 'Enter the Password Correctly',
                    });
                    db.close();
                  }
                },
              );
            } else {
              res.status(404).json({
                success: false,
                error,
                message: 'Unable to Find the Author with the Email',
              });
              db.close();
            }
          });
        })
        .catch((error) => {
          res.status(403).json({
            success: false,
            message: 'Server Error',
            error,
          });
          db.close();
        });
    } else {
      res.status(401).json({
        success: false,
        message: 'Please Enter Mandatory Details',
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
