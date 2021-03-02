const express = require('express');
const router = express.Router();
const path = require('path');
const originCheck = require('../helpers/checkOrigin');
const db = require('../helpers/mongo');

router.use('/blog', require('./blog'));
router.use('/author', require('./author'));
router.use('/stories', require('./stories'));
router.use('/gallery', require('./gallery'));
router.use('/notification', require('./notifications'));
router.use('/tips', require('./tips'));
router.use('/externals', require('./externals'));

router.get(/(\/.*)+/, (req, res) => {
  res.status(200).sendFile(path.resolve(__dirname, '../views/index.html'));
});

router.post('/', (req, res) => {
  if (originCheck(req.headers.origin)) {
    db.connect()
      .then(() => {
        res.status(200).json({
          success: true,
          message: 'Backend and Database Working',
        });
        db.close();
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

module.exports = router;
