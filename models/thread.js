const mongoose = require('mongoose');

let replySchema = mongoose.Schema({
  text: String,
  created_on: {
    type: Date,
    default: new Date().toISOString()
  },
  delete_password: String,
  reported: {
    type: Boolean,
    default: false
  }
});

let threadSchema = mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: new Date().toISOString()
  },
  bumped_on: {
    type: Date,
    default: new Date().toISOString()
  },
  reported: {
    type: Boolean,
    default: false
  },
  delete_password: {
    type: String,
    required: true
  },
  replies: [replySchema]
});

module.exports = mongoose.model("Thread", threadSchema);