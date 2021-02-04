const mongoose = require('mongoose');

const blogPostScheme = {
  headline: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  body: [
    {
      doctype: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
};

const Blog = mongoose.model('Blog', blogPostScheme);

module.exports = Blog;
