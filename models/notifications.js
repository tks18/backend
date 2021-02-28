const mongoose = require('mongoose');

let notificationSchema = {
  start: {
    type: Date,
    default: Date.now,
    required: true,
  },
  end: {
    type: Date,
    default: Date.now,
    required: true,
  },
  properties: {
    type: Object,
    required: true,
  },
};

const notification = mongoose.model('Notification', notificationSchema);

module.exports = notification;
