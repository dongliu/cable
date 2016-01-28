#!/usr/bin/env node

/**
 * @fileOverview Read a csv file with cable number and change details and apply them to mongoDB.
 * @author Dong Liu
 */

/*jslint es5: true*/

var csv = require('csv');

var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');
var Cable = require('../model/request.js').Cable;
var MultiChange = require('../model/request.js').MultiChange;
var program = require('commander');

var inputPath;
var realPath;
var db;
var line = 0;
var changes = [];
var parser;
var properties = [];

// var version = '';

program.version('0.0.1')
  .option('-d, --dryrun', 'dry run')
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

mongoose.connect('mongodb://localhost/cable_frib');
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('db connected');
});

function updateCable(change, i) {
  console.log('processing change ' + i);
  Cable.findOne({
    number: change[0]
  }).exec(function (err, cable) {
    if (err) {
      console.error(err);
    } else {
      if (!cable) {
        console.error('cannot find cable with id ' + change[0]);
      }

      var update = {};
      var updates = [];

      properties.forEach(function (p, index) {
        if (cable.get(p) === change[2 * index + 1]) {
          // empty means no change
          if (change[2 * index + 2].length !== 0) {
            update[p] = change[2 * index + 2];
            updates.push({
              property: p,
              oldValue: change[2 * index + 1],
              newValue: change[2 * index + 2]
            });
          }
        } else {
          console.log('cable ' + cable.number + ' ' + p + ' is ' + cable.get(p) + ', expect ' + change[2 * index + 1]);
        }
      });
      var multiChange;
      if (updates.length > 0) {
        multiChange = new MultiChange({
          cableName: cable.number,
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
        if (program.dryrun) {
          console.log('cable ' + cable.number + ' will be updated with ' + JSON.stringify(update, null, 2));
        } else {
          multiChange.save(function (err1, c) {
            if (err) {
              console.error(err1);
            } else {
              update.$push = {
                changeHistory: c._id
              };
              cable.update(update, {
                new: true
              }, function (err2) {
                if (err2) {
                  console.error(err2);
                } else {
                  console.log('cable ' + cable.number + ' was updated with ' + JSON.stringify(update, null, 2));
                }
              });
            }
          });
        }
      } else {
        console.error('no changes for cable ' + cable.number);
      }
    }
  });

}

parser = csv.parse({
  trim: true
});

parser.on('readable', function () {
  var record = parser.read();
  var i;

  while (record) {
    line += 1;
    console.log('read ' + line + ' lines ...');
    if (line === 1) {
      if (record[0] !== 'number') {
        console.log('the first column should be number');
        process.exit(1);
      }
      for (i = 1; i < record.length; i += 1) {
        if (i % 2 === 1) {
          // empty columns
          if (record[i].length === 0) {
            break;
          }
          properties.push(record[i]);
        }
      }
    } else if (record[0].length === 9) {
      changes.push(record);
    }
    record = parser.read();
  }
});

parser.on('error', function (err) {
  console.log(err.message);
});

parser.on('finish', function () {
  console.log('Finished parsing the csv file at ' + Date.now());
  console.log('Starting to apply changes.');
  changes.forEach(function (change, index) {
    updateCable(change, index);
  });
});

fs.createReadStream(realPath).pipe(parser);

// keep running until the user interrupts
process.stdin.resume();
