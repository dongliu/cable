/**
 * @fileOverview read a csv file with updated field details and update all the docs in mongo.
 * @author Dong Liu
 */

var csv = require('csv');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var Request = require('../model/request.js').Request;
var Cable = require('../model/request.js').Cable;
var Change = require('../model/request.js').Change;

var inputPath;
var realPath;
var db;
var line = 0;
var specLine = 0;
var spec = {};
var parser;
var cablesProcessed = 0;
var cablesToUpdate = 0;
var cablesUpdated = 0;
var cablesChecked = 0;
var requestsProcessed = 0;
var requestsToUpdate = 0;
var requestsUpdated = 0;
var requestsChecked = 0;

var dryrun = false;

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

function requestsDone() {
  console.log(requestsChecked + ' requests were checked, ' + requestsToUpdate + ' requests need update, and ' + requestsUpdated + ' were updated.');
  console.log('Bye.');
  mongoose.connection.close();
  process.exit();
}

function itemsAllChecked(total, processed, cb) {
  if (total === processed) {
    console.log(total + ' items are processed.');
    cb();
  }
}

function checkRequests() {
  Request.where('status').equals(1).exec(function (err, docs) {
    var current = 0;
    if (err) {
      console.error(err);
      requestsDone();
    } else {
      console.log('find ' + docs.length + ' requests in db.');
      docs.forEach(function (doc) {
        console.log('checking ' + (++current) + ' request with id ' + doc._id);
        var modified = 0;
        var update = {};
        if (!!doc.from.rack && spec.hasOwnProperty(doc.from.rack.trim())) {
          update['from.rack'] = spec[doc.from.rack.trim()];
          console.log('need to update request ' + doc._id + ' at from.rack');
          modified += 1;
        }
        if (!!doc.to.rack && spec.hasOwnProperty(doc.to.rack.trim())) {
          update['to.rack'] = spec[doc.to.rack.trim()];
          console.log('need to update request ' + doc._id + ' at to.rack');
          modified += 1;
        }
        requestsChecked += 1;
        if (modified > 0) {
          requestsToUpdate += 1;
        }
        if (dryrun) {
          requestsProcessed += 1;
          itemsAllChecked(docs.length, requestsProcessed, requestsDone);
        } else {
          if (modified > 0) {
            update.updatedOn = Date.now();
            update.updatedBy = 'system';
            doc.update(update, {
              new: true
            }, function (err, cable) {
              if (err) {
                console.error(err);
              } else {
                requestsUpdated += 1;
              }
              requestsProcessed += 1;
              itemsAllChecked(docs.length, requestsProcessed, requestsDone);
            });
          } else {
            requestsProcessed += 1;
            itemsAllChecked(docs.length, requestsProcessed, requestsDone);
          }
        }
      });
    }
  });
}

function cablesDone() {
  console.log(cablesChecked + ' cables were checked, ' + cablesToUpdate + ' cables need update, and ' + cablesUpdated + ' were updated.');
  console.log('Starting processing requests ...');
  checkRequests();
}

function checkCables() {
  Cable.where('status').gte(100).lte(199).exec(function (err, docs) {
    var current = 0;
    if (err) {
      console.error(err);
      cablesDone();
    } else {
      console.log('find ' + docs.length + ' cables in db.');
      docs.forEach(function (doc) {
        console.log('checking ' + (++current) + ' cable with id ' + doc._id);
        var modified = 0;
        var update = {};
        if (!!doc.from.rack && spec.hasOwnProperty(doc.from.rack.trim())) {
          update['from.rack'] = spec[doc.from.rack.trim()];
          console.log('need to update cable ' + doc._id + ' at from.rack');
          modified += 1;
        }
        if (!!doc.to.rack && spec.hasOwnProperty(doc.to.rack.trim())) {
          update['to.rack'] = spec[doc.to.rack.trim()];
          console.log('need to update cable ' + doc._id + ' at to.rack');
          modified += 1;
        }
        cablesChecked += 1;
        if (modified > 0) {
          cablesToUpdate += 1;
        }
        if (dryrun) {
          cablesProcessed += 1;
          itemsAllChecked(docs.length, cablesChecked, cablesDone);
        } else {
          if (modified > 0) {
            update.updatedOn = Date.now();
            update.updatedBy = 'system';
            var change = new Change({
              cableName: doc._id,
              // update: update,
              updatedBy: 'system',
              updatedOn: Date.now()
            });
            update.$inc = {
              __v: 1
            };
            change.save(function (err, c) {
              dryrun = true;
              if (err) {
                console.error(err);
                cablesProcessed += 1;
                itemsAllChecked(docs.length, cablesProcessed, cablesDone);
              } else {
                update.$push = {
                  changeHistory: c._id
                };
                doc.update(update, {
                  new: true
                }, function (err, cable) {
                  if (err) {
                    console.error(err);
                  } else {
                    cablesUpdated += 1;
                  }
                  cablesProcessed += 1;
                  itemsAllChecked(docs.length, cablesProcessed, cablesDone);
                });
              }
            });
          } else {
            cablesProcessed += 1;
            itemsAllChecked(docs.length, cablesProcessed, cablesDone);
          }
        }
      });
    }
  });
}

function specParsed() {
  console.log(specLine + ' spec lines are parsed.');
  console.log('Starting processing cables ...');
  checkCables();
  // checkRequests();
}


parser = csv.parse();

parser.on('readable', function () {
  var record;
  do {
    record = parser.read();
    if (!!record) {
      line += 1;
      // console.log('read ' + line + ' line of the spec ...');
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
  specParsed();
});

fs.createReadStream(realPath).pipe(parser);
