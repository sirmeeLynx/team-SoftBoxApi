const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we create a user schema
let fingerSchema = new Schema({
  fingerTemplate: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
  ssoid: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    required: false
  },
  updatedAt: {
    type: Number,
    required: false
  },
}, { runSettersOnQuery: true });

fingerSchema.pre('save', function (next) {

  var currentDate = new Date().getTime();
  this.updatedAt = currentDate;

  if (!this.created_at) {
    this.createdAt = currentDate;
  }

  next();
})

var fingerprint = mongoose.model('fingerprint', fingerSchema);

module.exports = fingerprint;