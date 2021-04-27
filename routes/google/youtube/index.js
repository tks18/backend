const express = require('express');

const router = express.Router();

// Local
const { yt_request } = require('../../../helpers/google-oauth');

const youtube_base_api = 'https://youtube.googleapis.com/youtube/v3/';
const youtube_api_paths = {
  my_videos: {
    url: (part, maxResults) =>
      `${youtube_base_api}search?part=${part}&forMine=true&maxResults=${maxResults}&type=video`,
  },
  channel_data: {
    url: (channel_id) =>
      `${youtube_base_api}channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channel_id}`,
  },
};

router.post('/videos', async (req, res) => {
  yt_request({
    url: youtube_api_paths.my_videos.url('snippet', 25),
    res,
  });
});

router.post('/channel-data', async (req, res) => {
  const { channel_id } = req.body;
  if (channel_id) {
    yt_request({
      url: youtube_api_paths.channel_data.url(channel_id),
      res,
    });
  } else {
    res.status(401).json({
      success: false,
      message:
        'channelid - Required Param - Not Present. Rejecting the Request',
    });
  }
});

module.exports = router;
