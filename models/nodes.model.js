const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we create a user schema
let nodesSchema = new Schema({
  orgPublickey: {
    type: String,
    required: true,
    index: true
  },
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

nodesSchema.pre('save', function (next) {
  next();
})

var block = mongoose.model('nodes', nodesSchema);

module.exports = block;