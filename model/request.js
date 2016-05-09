/*jslint es5:true*/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;
var ObjectId = Schema.Types.ObjectId;

// request status
// 0: saved
// 1: submitted
// 2: approved
// 3: rejected

// cable status
// procuring
//   100: approved
//   101: ordered
//   102: received
//   103: accepted
// installing
//   200: ready for installation
//   201: labeled
//   202: bench terminated
//   203: bench tested
//   249: ready for pull
//   250: pulled
//   251: field terminated
//   252: field tested
// working: 3xx
// failed: 4xx
// obsoleted: 5xx
//   501: not needed

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
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
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
      min: 1,
      max: 100,
      default: 1
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

  ownerProvided: {
    type: Boolean,
    default: false
  },

  length: Number,
  conduit: String,
  routing: [Mixed],

  comments: String,
  status: {
    type: Number,
    index: true
  },
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
  status: {
    type: Number,
    index: true
  },
  ownerProvided: {
    type: Boolean,
    default: false
  },
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
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
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

  length: Number,
  conduit: String,
  routing: [Mixed],

  comments: String,
  submittedBy: String,
  submittedOn: Date,
  approvedBy: String,
  approvedOn: Date,
  updatedOn: Date,
  updatedBy: String,
  obsoletedOn: Date,
  obsoletedBy: String,
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
  fieldTestedOn: Date,
  changeHistory: [ObjectId]
});

var change = new Schema({
  cableName: String,
  property: String,
  oldValue: Mixed,
  newValue: Mixed,
  updatedBy: String,
  updatedOn: Date
});

var update = new Schema({
  property: String,
  oldValue: Mixed,
  newValue: Mixed
});

var multiChange = new Schema({
  cableName: String,
  updates: [update],
  updatedBy: String,
  updatedOn: Date
});

var Request = mongoose.model('Request', request);
var Cable = mongoose.model('Cable', cable);
var Change = mongoose.model('Change', change);
var MultiChange = mongoose.model('MultiChange', multiChange);


module.exports = {
  Cable: Cable,
  Change: Change,
  MultiChange: MultiChange,
  Request: Request
};
