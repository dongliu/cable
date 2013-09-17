var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var request = new Schema({
  basic: {
    project: String,
    system: String,
    subsystem: String,
    signal: String,
    cableType: String,
    engineer: String,
    service: String,
    wbs: String,
    quantity: Number
  },

  from: {
    building: String,
    area: String,
    room: String,
    rack: String,
    elevation: Number,
    unit: String,
    terminationDevice: String,
    terminationType: String,
    wiringDrawing: String,
    label: String
  },

  to: {
    building: String,
    area: String,
    room: String,
    rack: String,
    elevation: Number,
    unit: String,
    terminationDevice: String,
    terminationType: String,
    wiringDrawing: String,
    label: String
  },

  // routing: {
  //   trayGroup: String,
  //   penetration: String,
  //   penetrationZ: String
  // },

  // other: {
    // fabricatedBy: String,
    // terminatedBy: String,
    // comments: String
  // },
  comments: String,
  status: Number,
  createdBy: String,
  createdOn: Date,
  updatedBy: String,
  updatedOn: Date,
  submittedBy: String,
  submittedOn: Date,
  // adjustedBy: String,
  // adjustedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  rejectedBy: String,
  rejectedOn: Date
});

var cable = new Schema({
  request_id: String,
  number: String,
  status: Number,
  submittedBy: String,
  submittedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  orderedBy: String,
  orderedOn: Date,
  receivedBy: String,
  receivedOn: Date,
  acceptedBy: String,
  acceptedOn: Date,
  labeledBy: String,
  labeledOn: Date,
  benchTerminatedBy: String,
  benchTerminatedOn: Date,
  benchTestedBy: String,
  benchTestedOn: Date,
  pulledBy: String,
  pulledOn: Date,
  fieldTerminatedBy: String,
  fieldTerminatedOn: Date,
  testedBy: String,
  testedOn: Date
});

var Request = mongoose.model('Request', request);
var Cable = mongoose.model('Cable', cable);


module.exports = {
  Cable: Cable,
  Request: Request
};