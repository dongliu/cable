/*jslint es5:true*/

import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cableType = new Schema({
  name: {
    type: String,
    index: true,
    unique: true,
    match: /\d+C_\w+_\w+_\d\d\d/,
    required: true,
  },
  service: String,
  conductorNumber: {
    type: Number,
    required: true,
  },
  conductorSize: {
    type: String,
    required: true,
  },
  fribType: {
    type: String,
    enum: {
      values: ['7-Pole', 'Multi', 'PwrAC', 'PwrDC', 'ArmPwrDC', 'Coax', 'Hardline', 'RigidLine', 'Cat6', 'TCtypeJ', 'TCtypeK', 'Sfib', 'SMfiber', 'MMfiber', 'PMMfiberRAD', 'Triax'],
      message: 'enum validator failed for "{PATH}" with value "{VALUE}"',
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
  updatedOn: Date,
});


var CableType = mongoose.model('CableType', cableType);

export = {
  CableType: CableType
};
