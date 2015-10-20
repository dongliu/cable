/**
 * @fileOverview update a field according to a simple spec
 * @author Dong Liu
 */

var mongoose = require('mongoose');
var Request = require('../model/request.js').Request;
var Cable = require('../model/request.js').Cable;
var Change = require('../model/request.js').Change;

var choice;
var db;
var spec = {
  field_name: 'basic.cableType',
  from_value: '2C_RG-59_Coax_035',
  to_value: '2C_5kVDC_Coax_035'
};
var cablesProcessed = 0;
var cablesToUpdate = 0;
var cablesUpdated = 0;
var cablesChecked = 0;
var requestsProcessed = 0;
var requestsToUpdate = 0;
var requestsUpdated = 0;
var requestsChecked = 0;

var dryrun = true;

if (process.argv.length === 3) {
  choice = process.argv[2].toLowerCase();
} else {
  console.warn('needs exact one argument for cable|request');
  process.exit(1);
}

if (['cable', 'request'].indexOf(choice) === -1) {
  console.warn('Not a valid choice.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/cable_frib');

db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('db connected');
});

function allDone() {
  if (dryrun) {
    console.log('Please note that this is a dryrun.');
  }
  switch (choice) {
  case 'request':
    console.log(requestsChecked + ' requests were checked, ' + requestsToUpdate + ' requests need update, and ' + requestsUpdated + ' were updated.');
    break;
  case 'cable':
    console.log(cablesChecked + ' cables were checked, ' + cablesToUpdate + ' cables need update, and ' + cablesUpdated + ' were updated.');
    break;
  default:
  }
  mongoose.connection.close();
  console.log('Bye.');
}

function itemsAllChecked(total, processed, cb) {
  if (total === processed) {
    console.log(total + ' items are processed.');
    if (cb) {
      cb();
    }
  }
}

function checkRequests() {
  console.log('Starting processing requests ...');
  Request.where('status').equals(1).exec(function (err, docs) {
    var current = 0;
    if (err) {
      console.error(err);
    } else {
      console.log('find ' + docs.length + ' requests to process in db.');
      docs.forEach(function (doc) {
        console.log('checking ' + (++current) + ' request with id ' + doc._id);
        var modified = 0;
        var update = {};
        if (doc.get(spec.field_name) === spec.from_value) {
          update[spec.field_name] = spec.to_value;
          console.log('need to update request ' + doc._id + ' at ' + spec.field_name);
          modified += 1;
          requestsToUpdate += 1;
        }
        requestsChecked += 1;
        if (dryrun) {
          requestsProcessed += 1;
          itemsAllChecked(docs.length, requestsProcessed, allDone);
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
              itemsAllChecked(docs.length, requestsProcessed, allDone);
            });
          } else {
            requestsProcessed += 1;
            itemsAllChecked(docs.length, requestsProcessed, allDone);
          }
        }
      });
    }
  });
}

function checkCables() {
  console.log('Starting processing cables ...');
  Cable.where('status').gte(100).lte(199).exec(function (err, docs) {
    var current = 0;
    if (err) {
      console.error(err);
    } else {
      console.log('find ' + docs.length + ' cables in db.');
      docs.forEach(function (doc) {
        console.log('checking ' + (++current) + ' cable with id ' + doc._id);
        var update = {};
        var change;
        if (doc.get(spec.field_name) === spec.from_value) {
          update[spec.field_name] = spec.to_value;
          change = new Change({
            cableName: doc._id,
            property: spec.field_name,
            oldValue: spec.from_value,
            newValue: spec.to_value,
            updatedBy: 'system',
            updatedOn: Date.now()
          });
          console.log('need to update cable ' + doc._id + ' at ' + spec.field_name);
          cablesToUpdate += 1;
        }
        cablesChecked += 1;
        if (dryrun) {
          cablesProcessed += 1;
          itemsAllChecked(docs.length, cablesProcessed, allDone);
        } else {
          if (!!change) {
            update.updatedOn = Date.now();
            update.updatedBy = 'system';
            update.$inc = {
              __v: 1
            };
            change.save(function (err, c) {
              if (err) {
                console.error(err);
                cablesProcessed += 1;
                itemsAllChecked(docs.length, cablesProcessed, allDone);
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
                  itemsAllChecked(docs.length, cablesProcessed, allDone);
                });
              }
            });
          } else {
            cablesProcessed += 1;
            itemsAllChecked(docs.length, cablesProcessed, allDone);
          }
        }
      });
    }
  });
}


if (choice === 'request') {
  checkRequests();
}

if (choice === 'cable') {
  checkCables();
}

// keep running until the user interrupts
process.stdin.resume();
