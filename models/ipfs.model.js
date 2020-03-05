const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we create a user schema
let ipfsSchema = new Schema({
  userPublickey: {
    type: String,                                                                 
    required: true,
    index: true
  },
  orgPublickey: {
    type: String
  },
  userData: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: false
  },
  updatedAt: {
    type: Number,
    required: false
  },
}, {runSettersOnQuery: true}); 

ipfsSchema.pre('save', function (next) {

  var currentDate = new Date().getTime();
  this.updatedAt = currentDate;

  if (!this.created_at) {
    this.createdAt = currentDate;
  }
  next();
})

var ipfs = mongoose.model('ipfs', ipfsSchema);

module.exports = ipfs;