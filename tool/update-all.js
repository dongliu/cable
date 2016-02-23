#!/usr/bin/env node

/**
 * @fileOverview update all the items according to a simple spec
 * @author Dong Liu
 */

/*jslint es5: true*/

var fs = require('fs');
var path = require('path');

var mongoose = require('mongoose');
var Request = require('../model/request.js').Request;
var Cable = require('../model/request.js').Cable;
var MultiChange = require('../model/request.js').MultiChange;

var program = require('commander');

var inputPath;
var realPath;
var db;
var spec;
var cablesProcessed = 0;
var cablesUpdated = 0;
var requestsProcessed = 0;
var requestsUpdated = 0;

program.version('0.0.1')
  .option('-d, --dryrun', 'dryrun')
  .option('-c, --cable', 'update cables according to the spec')
  .option('-r, --request', 'update request according to the spec')
  .arguments('<spec>')
  .action(function (p) {
    inputPath = p;
  });

program.parse(process.argv);

if (program.cable && program.request) {
  console.log('please choose one option either -c or -r');
  process.exit(1);
}

if (!program.cable && !program.request) {
  console.log('please choose either -c or -r');
  process.exit(1);
}

if (inputPath === undefined) {
  console.error('need the input json spec file path!');
  process.exit(1);
}

realPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(realPath)) {
  console.error(realPath + ' does not exist.');
  console.error('Please input a valid spec file path.');
  process.exit(1);
}

spec = require(realPath);

if (program.cable) {
  if (!spec.condition.status) {
    spec.condition.status = {
      $gte: 100,
      $lte: 199
    };
  }
}

if (program.request) {
  if (!spec.condition.status) {
    spec.condition.status = 1;
  }
}

console.log(JSON.stringify(spec, null, 2));

mongoose.connect('mongodb://localhost/cable_frib');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('db connected');
});

function allDone() {
  if (program.dryrun) {
    console.log('Please note that this is a dryrun.');
  }
  if (program.request) {
    console.log(requestsUpdated + ' were updated.');
  }
  if (program.cable) {
    console.log(cablesUpdated + ' were updated.');
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
  Request.find(spec.condition).exec(function (err, docs) {
    var current = 0;
    if (err) {
      console.error(err);
    } else {
      console.log('find ' + docs.length + ' requests to process for the condition.');
      if (program.dryrun) {
        docs.forEach(function (doc) {
          console.log('need to update ' + ++current + ' request with id ' + doc._id);
        });
        console.log('bye.');
      } else {
        docs.forEach(function (doc) {
          console.log('updating ' + ++current + ' request with id ' + doc._id);
          var update = {};
          spec.updates.forEach(function (c) {
            update[c.property] = c.newValue;
          });
          update.updatedOn = Date.now();
          update.updatedBy = 'system';
          update.$inc = {
            __v: 1
          };
          doc.update(update, {
            new: true
          }, function (updateErr) {
            if (updateErr) {
              console.error(updateErr);
            } else {
              requestsUpdated += 1;
            }
            requestsProcessed += 1;
            itemsAllChecked(docs.length, requestsProcessed, allDone);
          });
        });
      }
    }
  });
}

function checkCables() {
  console.log('Starting processing cables ...');
  Cable.find(spec.condition).exec(function (err, docs) {
    if (err) {
      console.error(err);
    } else {
      console.log('find ' + docs.length + ' cables to update.');
      if (program.dryrun) {
        docs.forEach(function (doc) {
          var update = {};
          var updates = [];
          spec.updates.forEach(function (u) {
            var index = u.oldValue.indexOf(doc[u.property]);
            if (index !== -1) {
              console.log('cable ' + doc.number + ' ' + u.property + ' change from ' + u.oldValue[index] + ' to ' + u.newValue[index]);
              update[u.property] = u.newValue[index];
              updates.push({
                property: u.property,
                oldValue: u.oldValue[index],
                newValue: u.newValue[index]
              });
            }
            var multiChange;
            if (updates.length > 0) {
              multiChange = new MultiChange({
                cableName: doc.number,
                updates: updates,
                updatedBy: 'system',
                updatedOn: Date.now()
              });
            }

            if (multiChange) {
              update.updatedOn = Date.now();
              update.updatedBy = 'system';
              update.$inc = {
                __v: 1
              };
              console.log('cable ' + doc.number + ' needs to update ' + updates.length + 'properties');
            } else {
              console.log('cable ' + doc.number + ' has no property to update');
            }
            cablesProcessed += 1;
            itemsAllChecked(doc.length, cablesProcessed, allDone);
          });
        });
        console.log('bye.');
      } else {
        docs.forEach(function (doc) {
          var update = {};
          var updates = [];
          spec.updates.forEach(function (u) {
            var index = u.oldValue.indexOf(doc[u.property]);
            if (index !== -1) {
              console.log('cable ' + doc.number + ' ' + u.property + ' change from ' + u.oldValue[index] + ' to ' + u.newValue[index]);
              update[u.property] = u.newValue[index];
              updates.push({
                property: u.property,
                oldValue: u.oldValue[index],
                newValue: u.newValue[index]
              });
            }
          });
          var multiChange;
          if (updates.length > 0) {
            multiChange = new MultiChange({
              cableName: doc.number,
              updates: updates,
              updatedBy: 'system',
              updatedOn: Date.now()
            });
          }

          if (multiChange) {
            update.updatedOn = Date.now();
            update.updatedBy = 'system';
            update.$inc = {
              __v: 1
            };
            multiChange.save(function (saveErr, c) {
              if (saveErr) {
                console.error(saveErr);
                cablesProcessed += 1;
                itemsAllChecked(doc.length, cablesProcessed, allDone);
              } else {
                update.$push = {
                  changeHistory: c._id
                };
                doc.update(update, {
                  new: true
                }, function (updateErr) {
                  if (updateErr) {
                    console.error(updateErr);
                  } else {
                    cablesUpdated += 1;
                  }
                  cablesProcessed += 1;
                  itemsAllChecked(doc.length, cablesProcessed, allDone);
                });
              }
            });
          } else {
            cablesProcessed += 1;
            console.log('cable ' + doc.number + ' has no property to update');
            itemsAllChecked(doc.length, cablesProcessed, allDone);
          }
        });
      }
    }
  });
}


if (program.request) {
  checkRequests();
}

if (program.cable) {
  checkCables();
}

// keep running until the user interrupts
process.stdin.resume();
