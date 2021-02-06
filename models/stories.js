const mongoose = require('mongoose');

const storySchema = {
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Number,
    required: true,
    default: Date.now,
  },
  asset: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
};

const Stories = mongoose.model('Story', storySchema);

module.exports = Stories;
