const mongoose = require('mongoose');

let tipSchema = {
  time: {
    type: Date,
    default: Date.now,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  notification: {
    type: Object,
    required: true,
  },
};

const tip = mongoose.model('Tip', tipSchema);

module.exports = tip;
