const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we create a user schema
let merkleSchema = new Schema({
  merkleroot: { //timestamp of merkle
    type: Number,
    required: true,
    index: true
  },
  merklehash: { //hash of merkle generated from txnlist
    type: String,
    required: true,
    index: true
  },
  txnlist: { //list of all txns that form root
    type: String,
    required: true,
  },
  txnRefid: { //user id
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

merkleSchema.pre('save', function (next) {

  var currentDate = new Date().getTime();
  this.updatedAt = currentDate;

  if (!this.created_at) {
    this.createdAt = currentDate;
  }

  next();
})

var merkle = mongoose.model('merkle', merkleSchema);

module.exports = merkle;