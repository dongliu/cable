/**
 * @fileOverview read a csv file with cable request details and insert them into mongo.
 * @author Dong Liu
 */

var csv = require('csv'),
  fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  Request = require('../model/request.js').Request;

var naming = require('../lib/naming');

var inputPath, realPath, db, line = 0,
  requests = [],
  parser, processed = 0,
  success = 0;

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
  return s ? s.replace(/^(?:\s*,?)+/, '').replace(/(?:\s*,?)*$/, '').split(/\s*,\s*/) : [];
}

function createRequest(requests, i) {
  var request = requests[i];
  var namecodes = naming.encode(request[3].trim(), request[4].trim(), request[5].trim());
  if (namecodes.length !== 3) {
    console.log('cannot encode the name of ' + requests[i]);
    if (i === requests.length - 1) {
      jobDone();
    } else {
      createRequest(requests, i + 1);
    }
  } else {
    Request.create({
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

      conduit: request[19],
      comments: request[20],
      status: 1,
      createdBy: 'system',
      createdOn: Date.now(),
      submittedBy: 'system',
      submittedOn: Date.now()
    }, function (err, doc) {
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
}


parser = csv.parse();

parser.on('readable', function () {
  var record;
  do {
    record = parser.read();
    if (!!record) {
      line += 1;
      console.log('read ' + line + ' lines ...');
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
