const mongoose = require('mongoose');

const authorSchema = {
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  github: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
};

const Author = mongoose.model('Author', authorSchema);

module.exports = Author;
