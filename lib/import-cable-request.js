/**
 * @fileOverview read a csv file with cable request details and insert them into mongo.
 * @author Dong Liu
 */

var csv = require('csv'),
  fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  Request = require('../model/request.js').Request;

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

/**
 * encode category, subcatogory, and signal to name code
 * @param  {string}   cat
 * @param  {string}   sub
 * @param  {string}   sig
 * @return  {string[]}   the three codes, an array with less than three elements indicates error.
 */

function nameEncoding(cat, sub, sig) {
  if (true) {
    return ['1', '2', 'C'];
  } else {
    return [];
  }
}

function cannotEncode(requests, i) {
  console.log('cannot encode the name of ' + requests[i]);
  if (i === requests.length - 1) {
    console.log(requests.length + 'requests were processed, and ' + success + ' requests were inserted. Bye.');
    mongoose.connection.close();
    process.exit();
  } else {
    createRequest(requests, i + 1);
  }
}


/**
 * split a string into an array
 * @param  {string}   a
 * @return  {string[]}   a string array
 */
function splitTags(s) {
   return s ? s.replace(/^(?:\s*,?)+/, '').replace(/(?:\s*,?)*$/, '').split(/\s*,\s*/) : [];
}

function createRequest(requests, i) {
  var request = requests[i];
  var namecodes = nameEncoding(request[3], request[4], request[5]);
  if (namecodes.length !== 3) {
    cannotEncode(requests, i);
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
      // processed += 1;
      if (err) {
        console.log(err);
      } else {
        success += 1;
        console.log('New type created with id: ' + doc.id);
      }
      if (i === types.length - 1) {
        console.log(processed + 'types were processed, and ' + success + ' types were inserted. Bye.');
        mongoose.connection.close();
        process.exit();
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
      if (record.length > 2 && record[1].length === 3) {
        types.push(record);
      }
    }
  } while (!!record);
});

parser.on('error', function (err) {
  console.log(err.message);
});

parser.on('finish', function () {
  var i;
  for (i = 0; i < types.length; i += 1) {
    createType(types, i);
  }
});

fs.createReadStream(realPath).pipe(parser);
