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
    wbs: String,
    quality: Number
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
  createdBy: String,
  createdOn: Date,
  updatedBy: String,
  updatedOn: Date,
  submittedBy: String,
  submittedOn: Date,
  adjustedBy: String,
  adjustedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  rejectedBy: String,
  rejectedOn: Date
});

var cable = new Schema({
  request_id: String,
  number: {
    type: String,
    unique: true,
    index: true
  },
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