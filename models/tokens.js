const mongoose = require('mongoose');

const token_schema = {
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
    unique: false,
    default: Date.now(),
  },
  website: {
    type: String,
    required: true,
    unique: false,
  },
  expires_in: {
    type: Date,
    required: true,
    unique: false,
  },
  scope: {
    type: String,
    required: true,
    unique: false,
  },
  additional_tokens: {
    type: Array,
    required: false,
    unique: false,
  },
};

const Token = mongoose.model('Token', token_schema);

module.exports = Token;
