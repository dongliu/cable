var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var request = new Schema({
  basic: {
    system: String,
    subsystem: String,
    signal: String,
    cableType: String,
    engineer: String,
    service: String,
    wbs: String
    // ,quality: Number The quality can make the assign cable number tricky
  },

  from: {
    building: String,
    rack: String,
    elevation: Number,
    ternimationDevice: String,
    ternimationType: String,
    wiringDrawing: String,
    label: String
  },

  to: {
    building: String,
    rack: String,
    elevation: Number,
    ternimationDevice: String,
    ternimationType: String,
    wiringDrawing: String,
    label: String
  },

  routing: {
    trayGroup: String,
    penetration: String,
    penetrationZ: String
  },

  other: {
    fabricatedBy: String,
    terminatedBy: String,
    comments: String
  },
  status: Number,
  createdBy: String,
  createdOn: Date,
  updatedBy: String,
  updatedOn: Date,
  submittedBy: String,
  submittedOn: Date,
  adjustedBy: String,
  adjustedOn: Date,
  requestedBy: String,
  requestedOn: Date,
  rejectedBy: String,
  rejectedOn: Date
});

var cable = new Schema({
  request_id: String,
  number: {
    type: String,
    // index: true,
    unique: true
  },
  status: Number,
  basic: {
    system: String,
    subsystem: String,
    signal: String,
    cableType: String,
    engineer: String,
    service: String,
    wbs: String
    // ,quality: Number The quality can make the assign cable number tricky
  },

  from: {
    building: String,
    rack: String,
    elevation: Number,
    ternimationDevice: String,
    ternimationType: String,
    wiringDrawing: String,
    label: String
  },

  to: {
    building: String,
    rack: String,
    elevation: Number,
    ternimationDevice: String,
    ternimationType: String,
    wiringDrawing: String,
    label: String
  },

  routing: {
    trayGroup: String,
    penetration: String,
    penetrationZ: String
  },

  other: {
    fabricatedBy: String,
    terminatedBy: String,
    comments: String
  },

  submittedBy: String,
  submittedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  fufilledBy: String,
  fufilledOn: Date,
  installedBy: String,
  installedOn: Date,
  qaedBy: String,
  qaedOn: Date,
  failedOn: Date,
  replacedBy: String,
  replacedOn: Date
});

var Request = mongoose.model('Request', request);
var Cable = mongoose.model('Cable', cable);


module.exports = {
  Cable: Cable,
  Request: Request
};