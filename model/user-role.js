var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var role = new Schema({
  account : {type: String, index: true, unique: true},
  roles: [String]
});

var Role = mongoose.model('Role', role);
module.exports = {
  Role: Role
};