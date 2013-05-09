var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var cableType = new Schema({
  name : {type: String, index: true, unique: true},
  characteristics : String,
  diameter: String,
  service : String,
  voltage: String,
  insulation : String,
  jacket : String,
  raceway: String,
  tid: String,
  model : String,
  comments: String,
  spec: String,
  request: String,
  revision: String,
  date : String
});


var CableType = mongoose.model('CableType', cableType);

module.exports = {
  CableType: CableType
};