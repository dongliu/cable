/*jslint es5:true*/

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var cableType = new Schema({
  name: {
    type: String,
    index: true,
    unique: true
  },
  service: String,
  conductorNumber: Number,
  conductorSize: String,
  type: {
    type: String,
    enum: {
      values: ['Multi', 'PwrDC', 'ArmPwrDC', 'Coax', 'HardlineCoax', 'Cat6', 'TCtypeK', 'Sfib', 'Mfib', 'Unknown'],
      message: 'enum validator failed for "{PATH}" with value "{VALUE}"'
    }
  },
  pairing: String,
  shielding: String,
  outerDiameter: String,
  voltageRating: Number,
  raceway: String,
  insulation: String,
  jacket: String,
  tunnelHotcell: Boolean,
  otherRequirements: String
});


var CableType = mongoose.model('CableType', cableType);

module.exports = {
  CableType: CableType
};
