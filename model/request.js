/*jslint es5:true*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

var request = new Schema({
  basic: {
    project: {
      type: String,
      enum: ['FRIB', 'REA'],
      uppercase: true,
      required: true
    },
    engineer: String,
    wbs: {
      type: String,
      required: true
    },
    originCategory: {
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      required: true
    },
    originSubcategory: {
      type: String,
      enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      required: true
    },
    signalClassification: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
      required: true
    },
    cableType: String,
    service: String,
    traySection: {
      type: String,
      enum: ['HPRF', 'DC', 'VLLS', 'LLS', 'HVDC', 'MLS', 'AC', 'MV-AC', 'REF', 'PPS']
    },
    tags: [String],
    quantity: {
      type: Number,
      min: 1
    }
  },

  from: {
    rack: String,
    terminationDevice: String,
    terminationType: String,
    wiringDrawing: String,
    label: String
  },

  to: {
    rack: String,
    terminationDevice: String,
    terminationType: String,
    wiringDrawing: String,
    label: String
  },

  required: {
    label: Boolean,
    benchTerm: Boolean,
    benchTest: Boolean,
    fieldTerm: Boolean
  },

  conduit: String,
  routing: [Mixed],

  comments: String,
  status: Number,
  createdBy: String,
  createdOn: Date,
  updatedBy: String,
  updatedOn: Date,
  submittedBy: String,
  submittedOn: Date,
  revertedBy: String,
  revertedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  rejectedBy: String,
  rejectedOn: Date
});

var cable = new Schema({
  request_id: String,
  number: {
    type: String,
    index: true,
    unique: true
  },
  status: Number,
  basic: {
    project: {
      type: String,
      enum: ['FRIB', 'REA'],
      uppercase: true,
      required: true
    },
    engineer: String,
    wbs: {
      type: String,
      required: true
    },
    originCategory: {
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      required: true
    },
    originSubcategory: {
      type: String,
      enum: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      required: true
    },
    signalClassification: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
      required: true
    },
    cableType: String,
    service: String,
    traySection: {
      type: String,
      enum: ['HPRF', 'DC', 'VLLS', 'LLS', 'HVDC', 'MLS', 'AC', 'MV-AC', 'REF', 'PPS']
    },
    tags: [String]
  },

  from: {
    rack: String,
    terminationDevice: String,
    terminationType: String,
    wiringDrawing: String,
    label: String
  },

  to: {
    rack: String,
    terminationDevice: String,
    terminationType: String,
    wiringDrawing: String,
    label: String
  },

  required: {
    label: Boolean,
    benchTerm: Boolean,
    benchTest: Boolean,
    fieldTerm: Boolean
  },

  conduit: String,
  routing: [Mixed],

  comments: String,
  submittedBy: String,
  submittedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  updatedOn: Date,
  updatedBy: String,
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
  fieldTestedBy: String,
  fieldTestedOn: Date
});

var Request = mongoose.model('Request', request);
var Cable = mongoose.model('Cable', cable);


module.exports = {
  Cable: Cable,
  Request: Request
};
