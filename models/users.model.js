const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// we create a user schema
let userSchema = new Schema({
  privatekey: { 
    type: String, required: true 
  },
  publickey: { 
    type: String, required: true 
  },
  ssoID: { 
    type: String, trim: true 
  },
  orgPublickey: {
    type: String, trim: true 
  },
  createdAt: { 
    type: Date, required: false 
  },
  updatedAt: { 
    type: Number, required: false 
  },
}, {runSettersOnQuery: true});

userSchema.pre('save', function (next) {
  var currentDate = new Date().getTime();
  this.updatedAt = currentDate;

  if (!this.created_at) {
    this.createdAt = currentDate;
  }
  next();
})

var user = mongoose.model('users', userSchema);

module.exports = user;