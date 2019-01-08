/*jslint es5:true*/
import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
  adid: {
    type: String,
    lowercase: true,
    index: true,
    unique: true,
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
    default: false,
  },
});

const User = mongoose.model('User', user);
export = {
  User: User,
};
