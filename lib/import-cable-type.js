var csv = require('csv'),
  fs = require('fs'),
  path = require('path'),
  mongoose = require('mongoose'),
  CableType = require('../model/meta.js').CableType;

var fileName;
if (process.argv.length === 3) {
  fileName = process.argv[2];
} else {
  console.log(process.argv.length);
  console.warn('only needs one arguments');
  process.exit(1);
}

var filePath = path.resolve(__dirname, fileName);

console.log(filePath);

if (!fs.existsSync(filePath)) {
  console.warn(filePath + ' does not exist');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/cable');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

var stream = fs.createReadStream(__dirname + '/' + fileName);

db.once('open', function () {
  console.log('db connected');
});

var types = [];

csv()
  .from.stream(stream)
  .on('record', function (row, index) {
    if (index === 0) {
      console.log('headers');
    } else {
      types.push({
        name: row[0],
        characteristics: row[1],
        diameter: row[2],
        service: row[3],
        voltage: row[4],
        insulation: row[5],
        jacket: row[6],
        raceway: row[7],
        tid: row[8],
        model: row[9],
        comments: row[10],
        spec: row[11],
        request: row[12],
        revision: row[13],
        date: row[14]
      });
    }
  })
  .on('end', function (count) {
    console.log('lines: ' + count);
    CableType.create(types, function (err, docs) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('write to the db finished. ');
        CableType.count(function (err, count) {
          if (err) {
            console.log(err);
          } else {
            console.log('There are ' + count + ' cable types now.');
            mongoose.disconnect(function (err) {
              if (err) {
                console.log(err.message);
              } else {
                console.log('mongoose disconnected');
              }
            });
          }
        });
      }
    });
  })
  .on('error', function (error) {
    console.log(error.message);
  });
