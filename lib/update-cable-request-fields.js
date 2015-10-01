/**
 * @fileOverview read a csv file with updated field details and update all the docs in mongo.
 * @author Dong Liu
 */

var csv = require('csv');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var Request = require('../model/request.js').Request;
var Cable = require('../model/request.js').cable;
var Change = require('../model/request.js').change;

var inputPath;
var realPath;
var db;
var line = 0;
var specLine = 0;
var spec = {};
var parser;
var processed = 0;
var success = 0;

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

// mongoose.connect('mongodb://localhost/cable_frib');

// db = mongoose.connection;

// db.on('error', console.error.bind(console, 'connection error:'));

// db.once('open', function () {
//   console.log('db connected');
// });

function jobDone() {
  console.log(specLine + ' spec lines are parsed.');
  console.log(spec);
  // mongoose.connection.close();
  process.exit();
}


parser = csv.parse();

parser.on('readable', function () {
  var record;
  do {
    record = parser.read();
    if (!!record) {
      line += 1;
      console.log('read ' + line + ' line of the spec ...');
      if (record[0].indexOf('C') === 0) {
        spec[record[0]] = record[1];
        specLine += 1;
      }
    }
  } while (!!record);
});

parser.on('error', function (err) {
  console.log(err.message);
});

parser.on('finish', function () {
  jobDone();
});

fs.createReadStream(realPath).pipe(parser);
