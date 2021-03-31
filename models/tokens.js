const mongoose = require('mongoose');

const token_schema = {
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
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

const Token = mongoose.model('token_schema', token_schema);

module.exports = Token;
