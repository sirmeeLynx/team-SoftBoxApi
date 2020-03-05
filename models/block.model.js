const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we create a user schema
let blockSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  transactions: {
    type: String,
    required: true,
  },
  nonce: {
    type: Number,
    required: true,
  },
  previousHash: {
    type: String,
  },
  hash: {
    type: String,
    required: true,
  },
  txnRefid: {
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

blockSchema.pre('save', function (next) {

  var currentDate = new Date().getTime();
  this.updatedAt = currentDate;

  if (!this.created_at) {
    this.createdAt = currentDate;
  }

  next();
})

var block = mongoose.model('block', blockSchema);

module.exports = block;