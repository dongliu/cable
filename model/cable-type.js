var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

module.exports = function() {
  return new Schema({
    name : {type: String, index: true, unique: true},
    characteristics : String,
    diameter: Number,
    service : String,
    voltage: String,
    insulation : String,
    jacket : String,
    raceway: String,
    tid: Number,
    model : String,
    comments: String,
    spec: String,
    request: String,
    revision: String,
    date : Date
  });
};