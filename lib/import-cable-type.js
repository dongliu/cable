var csv = require('csv'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema;
  // cableType = require('../model/cable-type.js');

var fileName;
if (process.argv.length == 3) {
  fileName = process.argv[2];
} else {
  console.log(process.argv.length);
  console.warn('only needs one arguments');
  return;
}

var path = __dirname+'/'+fileName;

console.log(path);

if (!fs.existsSync(path)) {
  return console.warn(path + ' does not exist');
}

mongoose.connect('mongodb://localhost/cable');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

// var cableType = new Schema({
//   name : {type: String, index: true, unique: true},
//   characteristics : String,
//   diameter: Number,
//   service : String,
//   voltage: String,
//   insulation : String,
//   jacket : String,
//   raceway: String,
//   tid: Number,
//   model : String,
//   comments: String,
//   spec: String,
//   request: String,
//   revision: String,
//   date : Date
// });
var cableType = new Schema({
  name : {type: String, index: true, unique: true},
  characteristics : String,
  diameter: String,
  service : String,
  voltage: String,
  insulation : String,
  jacket : String,
  raceway: String,
  tid: String,
  model : String,
  comments: String,
  spec: String,
  request: String,
  revision: String,
  date : String
});

var CableType = mongoose.model('CableType', cableType);

var stream = fs.createReadStream(__dirname+'/'+fileName);

db.once('open', function(){
  console.log('db connected');
});

var types = [];

csv()
  .from.stream(stream)
  .on('record', function(row, index) {
    if (index === 0) {
      console.log('headers');
    } else {
      types.push({
        name : row[0],
        characteristics : row[1],
        diameter: row[2],
        service : row[3],
        voltage: row[4],
        insulation : row[5],
        jacket : row[6],
        raceway: row[7],
        tid: row[8],
        model : row[9],
        comments: row[10],
        spec: row[11],
        request: row[12],
        revision: row[13],
        date : row[14]
      });

      // // console.log(JSON.stringify(row.splice(0, 15)));
      // // csv.pause();
      // CableType.create({
      //   name : row[0],
      //   characteristics : row[1],
      //   diameter: row[2],
      //   service : row[3],
      //   voltage: row[4],
      //   insulation : row[5],
      //   jacket : row[6],
      //   raceway: row[7],
      //   tid: row[8],
      //   model : row[9],
      //   comments: row[10],
      //   spec: row[11],
      //   request: row[12],
      //   revision: row[13],
      //   date : row[14]
      // } , function(err, type){
      //   if (err) {
      //     console.log(err.message);
      //   } else {
      //     console.log(type);
      //   }
      //   // csv.resume();
      // });
    }
  })
  .on('end', function(count){
    console.log('lines: ' + count);
    CableType.create(types, function(err, type){
      if (err) {
        console.log(err.message);
      } else {
        console.log(type);
      }
    });
    mongoose.disconnect(function(err) {
      if (err) {
        console.log(err.message);
      } else {
        console.log('mongoose disconnected');
      }
    });
  })
  .on('error', function(error){
    console.log(error.message);
  });
