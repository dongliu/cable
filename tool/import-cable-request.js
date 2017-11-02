#!/usr/bin/env node

/**
 * @fileOverview read a csv file with cable request details and insert them into mongo.
 * @author Dong Liu
 */

/*jslint es5: true*/

var csv = require('csv');

var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var validator = require('validator');
var Request = require('../model/request.js').Request;
var program = require('commander');

var naming = require('../lib/naming');

var inputPath;
var realPath;
var db;
var line = 0;
var requests = [];
var lines = [];
var parser;
var success = 0;

var version = '';

program.version('0.0.1')
  .option('-v, --validate', 'validate data from spreadsheet')
  .arguments('<source>')
  .action(function (source) {
    inputPath = source;
  });

program.parse(process.argv);

if (inputPath === undefined) {
  console.error('need the input source csv file path!');
  process.exit(1);
}

realPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(realPath)) {
  console.error(realPath + ' does not exist.');
  console.error('Please input a valid csv file path.');
  process.exit(1);
}

if (!program.validate) {
  mongoose.connect('mongodb://localhost/cable_frib');
  db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log('db connected');
  });
}

function jobDone() {
  if (program.validate) {
    console.log(requests.length + ' requests were processed, and ' + success + ' requests were valid. Bye.');
  } else {
    console.log(requests.length + ' requests were processed, and ' + success + ' requests were inserted. Bye.');
    mongoose.connection.close();
  }
}

function splitTags(s) {
  return s ? s.replace(/^(?:\s*,?)+/, '').replace(/(?:\s*,?)*$/, '').split(/\s*[,;]\s*/) : [];
}

function isTrue(S) {
  var s = S.toLowerCase();
  return s === 'yes' || s === 'true';
}

function createRequest(i) {
  var request = requests[i];
  var namecodes;
  var newRequest;
  var quantityIndex = 10;
  var v2 = version.indexOf('v2') === 0;
  var v3 = version.indexOf('v3') === 0;
  // need more validation function here
  if (v2 || v3) {
    quantityIndex = 11;
  }
  if (!validator.isInt(request[quantityIndex])) {
    console.log('Line ' + lines[i] + ': the quantity is not an integer: ' + request[quantityIndex]);
    if (i === requests.length - 1) {
      return jobDone();
    }
    return createRequest(i + 1);
  }
  namecodes = naming.encode(request[3], request[4], request[5]);
  if (namecodes.indexOf(null) !== -1) {
    console.log('Line ' + lines[i] + ': cannot encode the name of: ' + request[3] + '/' + request[4] + '/' + request[5]);
    if (i === requests.length - 1) {
      return jobDone();
    }
    return createRequest(i + 1);
  }
  if (v3) {
    newRequest = {
      basic: {
        project: request[0],
        engineer: request[2],
        wbs: request[1],
        originCategory: namecodes[0],
        originSubcategory: namecodes[1],
        signalClassification: namecodes[2],
        cableType: request[7],
        service: request[9],
        traySection: request[6],
        tags: splitTags(request[10]),
        quantity: request[11]
      },
      from: {
        rack: request[12],
        terminationDevice: request[13],
        terminationType: request[14],
        terminationPort: request[15],
        wiringDrawing: request[16]
      },
      to: {
        rack: request[17],
        terminationDevice: request[18],
        terminationType: request[19],
        terminationPort: request[20],
        wiringDrawing: request[21]
      },
      ownerProvided: isTrue(request[8]),
      conduit: request[22],
      length: request[23],
      comments: request[24],
      status: 1,
      createdBy: 'system',
      createdOn: Date.now(),
      submittedBy: 'system',
      submittedOn: Date.now()
    };
  } else if (v2) {
    newRequest = {
      basic: {
        project: request[0],
        engineer: request[2],
        wbs: request[1],
        originCategory: namecodes[0],
        originSubcategory: namecodes[1],
        signalClassification: namecodes[2],
        cableType: request[7],
        service: request[9],
        traySection: request[6],
        tags: splitTags(request[10]),
        quantity: request[11]
      },
      from: {
        rack: request[12],
        terminationDevice: request[13],
        terminationType: request[14],
        wiringDrawing: request[15]
      },
      to: {
        rack: request[16],
        terminationDevice: request[17],
        terminationType: request[18],
        wiringDrawing: request[19]
      },
      ownerProvided: isTrue(request[8]),
      conduit: request[20],
      length: request[21],
      comments: request[22],
      status: 1,
      createdBy: 'system',
      createdOn: Date.now(),
      submittedBy: 'system',
      submittedOn: Date.now()
    };
  } else {
    newRequest = {
      basic: {
        project: request[0],
        engineer: request[2],
        wbs: request[1],
        originCategory: namecodes[0],
        originSubcategory: namecodes[1],
        signalClassification: namecodes[2],
        cableType: request[7],
        service: request[8],
        traySection: request[6],
        tags: splitTags(request[9]),
        quantity: request[10]
      },

      from: {
        rack: request[11],
        terminationDevice: request[12],
        terminationType: request[13],
        wiringDrawing: request[14]
      },

      to: {
        rack: request[15],
        terminationDevice: request[16],
        terminationType: request[17],
        wiringDrawing: request[18]
      },
      ownerProvided: false,
      conduit: request[19],
      length: request[20],
      comments: request[21],
      status: 1,
      createdBy: 'system',
      createdOn: Date.now(),
      submittedBy: 'system',
      submittedOn: Date.now()
    };
  }
  if (program.validate) {
    newRequest = new Request(newRequest);
    newRequest.validate(function (err) {
      if (err) {
        console.log('line ' + i + ':' + err);
      } else {
        success += 1;
      }
      if (i === requests.length - 1) {
        jobDone();
      } else {
        createRequest(i + 1);
      }
    });
  } else {
    Request.create(newRequest, function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        success += 1;
        console.log('New request created with id: ' + doc.id);
      }
      if (i === requests.length - 1) {
        jobDone();
      } else {
        createRequest(i + 1);
      }
    });
  }
}


parser = csv.parse({
  trim: true
});

parser.on('readable', function () {
  var record = parser.read();
  while (record) {
    line += 1;
    console.log('read ' + line + ' lines ...');
    if (line === 2) {
      version = record[0];
      console.log('template version: ' + version);
    }
    if (record[0] === 'FRIB') {
      requests.push(record);
      lines.push(line);
    }
    record = parser.read();
  }
});

parser.on('error', function (err) {
  console.log(err.message);
});

parser.on('finish', function () {
  createRequest(0);
});

fs.createReadStream(realPath).pipe(parser);

// keep running until the user interrupts
process.stdin.resume();
