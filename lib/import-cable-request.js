/**
 * @fileOverview read a csv file with cable request details and insert them into mongo.
 * @author Dong Liu
 */

var csv = require('csv'),
  fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  validator = require('validator'),
  Request = require('../model/request.js').Request;

var naming = require('../lib/naming');

var inputPath, realPath, db, line = 0,
  requests = [],
  parser, processed = 0,
  success = 0;

var version = '';

if (process.argv.length === 3) {
  inputPath = process.argv[2];
} else {
  console.warn('needs exact one argument for the input csv file path');
  process.exit(1);
}

realPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(realPath)) {
  console.warn(realPath + ' does not exist.');
  console.warn('Please input a valid csv file path.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/cable_frib');

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('db connected');
});

function jobDone() {
  console.log(requests.length + ' requests were processed, and ' + success + ' requests were inserted. Bye.');
  mongoose.connection.close();
  process.exit();
}

function splitTags(s) {
  return s ? s.replace(/^(?:\s*,?)+/, '').replace(/(?:\s*,?)*$/, '').split(/\s*[,;]\s*/) : [];
}

function createRequest(requests, i) {
  var request = requests[i];
  var namecodes;
  var newRequest;
  // need more validation function here
  if (!validator.isInt(request[10])) {
    console.log('The quantity is not an integer: ' + requests[i]);
    if (i === requests.length - 1) {
      return jobDone();
    }
    return createRequest(requests, i + 1);
  }
  namecodes = naming.encode(request[3].trim(), request[4].trim(), request[5].trim());
  if (namecodes.length !== 3) {
    console.log('cannot encode the name of: ' + requests[i]);
    if (i === requests.length - 1) {
      return jobDone();
    }
    return createRequest(requests, i + 1);
  }
  if (version === 'v2.0') {
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
      ownerProvided: request[8],
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
      createRequest(requests, i + 1);
    }
  });
}


parser = csv.parse();

parser.on('readable', function () {
  var record;
  do {
    record = parser.read();
    if (!!record) {
      line += 1;
      console.log('read ' + line + ' lines ...');
      if (line === 2) {
        if (record[0] === 'v2.0') {
          version = 'v2.0';
        }
      }
      if (record[0] === 'FRIB') {
        requests.push(record);
      }
    }
  } while (!!record);
});

parser.on('error', function (err) {
  console.log(err.message);
});

parser.on('finish', function () {
  createRequest(requests, 0);
});

fs.createReadStream(realPath).pipe(parser);
