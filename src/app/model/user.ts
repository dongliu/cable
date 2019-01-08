/*jslint es5:true*/
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var user = new Schema({
  adid: {
    type: String,
    lowercase: true,
    index: true,
    unique: true
  },
  name: String,
  email: String,
  office: String,
  phone: String,
  mobile: String,
  roles: [String],
  wbs: [String],
  lastVisitedOn: Date,
  subscribe: {
    type: Boolean,
    default: false
  }
});

var User = mongoose.model('User', user);
module.exports = {
  User: User
};
