/*jslint es5:true*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cableType = new Schema({
  name: {
    type: String,
    index: true,
    unique: true,
    match: /\d+C_\w+_\w+_\d\d\d/,
    required: true
  },
  service: String,
  conductorNumber: {
    type: Number,
    required: true
  },
  conductorSize: {
    type: String,
    required: true
  },
  fribType: {
    type: String,
    enum: {
      values: ['7-Pole', 'Multi', 'PwrDC', 'ArmPwrDC', 'Coax', 'Hardline', 'RigidLine', 'Cat6', 'TCtypeK', 'Sfib', 'MMfiber', 'PMMfiberRAD', 'Triax'],
      message: 'enum validator failed for "{PATH}" with value "{VALUE}"'
    },
    required: true
  },
  typeNumber: {
    type: String,
    required: true
  },
  pairing: String,
  shielding: String,
  outerDiameter: String,
  voltageRating: String,
  raceway: String,
  tunnelHotcell: Boolean,
  otherRequirements: String,
  manufacturer: String,
  partNumber: String,
  altManufacturer: String,
  altPartNumber: String,
  createdBy: String,
  createdOn: Date,
  updatedBy: String,
  updatedOn: Date
});


var CableType = mongoose.model('CableType', cableType);

module.exports = {
  CableType: CableType
};
