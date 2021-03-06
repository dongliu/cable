#!/usr/bin/env node

/**
 * @fileOverview Read a csv file with cable number and change details and apply them to mongoDB.
 * @author Dong Liu
 */


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
var done = 0;
var changes = [];
var parser;
var properties = [];

program.version('0.0.1')
  .option('-d, --dryrun', 'dry run')
  .arguments('<source>')
  .action(function (source) {
    inputPath = source;
  });

program.parse(process.argv);

if (inputPath === undefined) {
  console.error('Error: need the input source csv file path!');
  process.exit(1);
}

realPath = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(realPath)) {
  console.error('Error: ' + realPath + ' does not exist.');
  console.error('Please input a valid csv file path.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/cable_frib');
db = mongoose.connection;
db.on('error', function(err) {
  console.error(err.toString());
  process.exit(1);
});
db.once('open', function () {
  console.log('db connected');
});

function splitTags(s) {
  return s ? s.replace(/^(?:\s*,?)+/, '').replace(/(?:\s*,?)*$/, '').split(/\s*[,;]\s*/) : [];
}

function updateCable(change, i, callback) {
  console.log('processing change ' + i);
  Cable.findOne({ number: change[0] }).exec(function (err, cable) {
    if (err) {
      console.error(err.toString());
      callback(err);
      return;
    }

    if (!cable) {
      err = new Error('cannot find cable with id ' + change[0]);
      console.error(err.toString());
      callback(err);
      return;
    }

    var update = {};
    var updates = [];
    var multiChange = null;
    var conditionSatisfied = true;

    properties.forEach(function (p, index) {
      var currentType = Cable.schema.paths[p];
      if (!currentType) {
        err = new Error('cable does not have path "' + p + '"');
        console.error(err.toString());
        callback(err);
        return;
      }

      if (change[2 * index + 1] !== '_whatever_') {
        try {
          change[2 * index + 1] = currentType.cast(change[2 * index + 1]);
        } catch(e) {
          console.error(e.toString());
          callback(e);
          return;
        }
      }

      try {
        change[2 * index + 2] = currentType.cast(change[2 * index + 2]);
      } catch(e) {
        console.error(e.toString());
        callback(e);
        return;
      }

      var currentValue = cable.get(p);
      switch (p) {
      case 'basic.tags':
        if (Array.isArray(change[2 * index + 1])) {
          change[2 * index + 1] = change[2 * index + 1].join();
        }
        if (Array.isArray(change[2 * index + 2])) {
          change[2 * index + 2] = change[2 * index + 2].join();
        }
        currentValue = currentValue ? currentValue.join() : '';
        break;
      case 'status':
        change[2 * index + 1] = parseInt(change[2 * index + 1]);
        change[2 * index + 2] = parseInt(change[2 * index + 2]);
      }

      // Work around to ensure that date objects are properly compared.
      if (currentValue instanceof Date) {
        if (change[2 * index + 1] instanceof Date
            && change[2 * index + 1].getTime() === currentValue.getTime()) {
          change[2 * index + 1] = currentValue;
        }
        if (change[2 * index + 2] instanceof Date
            && change[2 * index + 2].getTime() === currentValue.getTime()) {
          change[2 * index + 2] = currentValue;
        }
      }

      if (change[2 * index + 1] === '_whatever_' || currentValue === change[2 * index + 1]) {
        if (change[2 * index + 2] !== currentValue) {
          if ([undefined, null, ''].indexOf(change[2 * index + 2]) !== -1 && [undefined, null, ''].indexOf(currentValue) !== -1) {
            // do nothing
          } else {
            if (p === 'basic.tags') {
              update[p] = splitTags(change[2 * index + 2]);
            } else {
              update[p] = change[2 * index + 2];
            }
            updates.push({
              property: p,
              oldValue: cable.get(p),
              newValue: update[p]
            });
          }
        }
      } else {
        console.error('Error: cable ' + cable.number + ' ' + p + ' is ' + cable.get(p) + ', expect ' + change[2 * index + 1]);
        conditionSatisfied = false;
      }
    });

    if (!conditionSatisfied) {
      err = new Error('conditions not satisfied for cable ' + cable.number);
      console.error(err.toString());
      callback(err);
      return;
    }

    if (updates.length <= 0) {
      console.log('cable ' + cable.number + ' will not be updated (no changes)');
      callback();
      return;
    }

    update.updatedOn = Date.now();
    update.updatedBy = 'system';
    update.$inc = {
      __v: 1
    };

    if (program.dryrun) {
      console.log('cable ' + cable.number + ' will be updated with ' + JSON.stringify(update, null, 2));
      callback();
      return;
    }

    multiChange = new MultiChange({
      cableName: cable.number,
      updates: updates,
      updatedBy: 'system',
      updatedOn: Date.now()
    });

    multiChange.save(function (err1, c) {
      if (err1) {
        console.error(err1.toString());
        callback(err1);
        return;
      }

      update.$push = {
        changeHistory: c._id
      };

      cable.update(update, { new: true }, function (err2) {
        if (err2) {
          console.error(err2.toString());
          callback(err2);
          return;
        }
        console.log('cable ' + cable.number + ' was updated with ' + JSON.stringify(update, null, 2));
        callback(null);
      });
    });
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
        console.error('Error: first column must be number');
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
  console.error(err.toString());
  process.exit(1);
});

parser.on('finish', function () {
  console.log('Finished parsing the csv file at ' + Date.now());
  console.log('Starting to apply changes.');
  changes.forEach(function (change, index) {
    updateCable(change, index, function(err) {
      done += 1;
      if (done === changes.length) {
        mongoose.disconnect();
      }
    });
  });
});

fs.createReadStream(realPath).pipe(parser);
