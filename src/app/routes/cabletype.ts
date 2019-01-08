/* tslint:disable:no-console */

import mongoose = require('mongoose');
//const CableType = mongoose.model('CableType');
const CableType = require('../model/meta').CableType;

import auth = require('../lib/auth');

import util = require('../lib/util');

export default function(app) {
  app.get('/cabletypes/', auth.ensureAuthenticated, function (req, res) {
    res.render('cabletype', {
      roles: req.session.roles,
    });
  });

  app.get('/cabletypes/manage', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles.indexOf('admin') !== -1) {
      return res.render('cabletypemgmt');
    }
    return res.send(403, 'You are not authorized to access this resource');
  });

  app.get('/cabletypes/new', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles.indexOf('admin') !== -1) {
      return res.render('newcabletype');
    }
    return res.send(403, 'You are not authorized to access this resource');
  });

  app.get('/cabletypes/json', auth.ensureAuthenticated, function (req, res) {
    CableType.find(function (err, docs) {
      if (err) {
        return res.send(500, err.message);
      }
      res.json(docs);
    });
  });

  app.post('/cabletypes/', auth.ensureAuthenticated, util.filterBody(['conductorNumber', 'conductorSize', 'fribType', 'typeNumber', 'newName', 'service', 'pairing', 'shielding', 'outerDiameter', 'voltageRating', 'raceway', 'tunnelHotcell', 'otherRequirements', 'manufacturer', 'partNumber']), function (req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('admin') === -1) {
      return res.send(403, 'You are not authorized to access this resource. ');
    }

    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }

    const newType = req.body;

    // generate the type name here
    newType.name = newType.conductorNumber + 'C_' + newType.conductorSize + '_' + newType.fribType + '_' + newType.typeNumber;
    newType.createdBy = req.session.userid;
    newType.createdOn = Date.now();

    (new CableType(newType)).save(function (err, type) {
      if (err) {
        console.dir(err);
        console.error(err.message || err.err);
        if (err.code && err.code === 11000) {
          return res.send(400, 'The type name ' + newType.name + ' was already used.');
        }
        return res.send(500, err.message || err.err);
      }
      const url = req.protocol + '://' + req.get('host') + '/cabletypes/' + type._id + '/';
      res.set('Location', url);
      return res.send(201, 'A new cable type is created at <a href="' + url + '"">' + url + '</a>');
    });
  });

  app.get('/cabletypes/:id/', auth.ensureAuthenticated, function (req, res) {
    res.redirect('/cabletypes/' + req.params.id + '/details');
  });

  app.get('/cabletypes/:id/details', auth.ensureAuthenticated, function (req, res) {
    CableType.findById(req.params.id).lean().exec(function (err, type) {
      if (err) {
        console.error(err);
        return res.send(500, err.message);
      }
      if (type) {
        res.render('typedetails', {
          type: type,
        });
      } else {
        res.send(410, 'The type ' + req.params.id + ' is gone.');
      }
    });
  });

  app.put('/cabletypes/:id', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('admin') === -1) {
      return res.send(403, 'You are not authorized to access this resource. ');
    }
    const conditions = {
      _id: req.params.id,
    };
    if (req.body.original === null) {
      conditions[req.body.target] = {
        $in: [null, '']
      };
    } else {
      conditions[req.body.target] = req.body.original;
    }
    const update: any = {};
    update[req.body.target] = req.body.update;
    update.updatedOn = Date.now();
    update.updatedBy = req.session.userid;
    CableType.findOneAndUpdate(conditions, update, {
      new: true,
    }, function (err, type) {
      // the err is not a mongoose error
      if (err) {
        if (err.errmsg) {
          console.dir(err.errmsg);
        }
        if (err.lastErrorObject && err.lastErrorObject.code === 11001) {
          return res.send(400, req.body.update + ' is already taken');
        }
        return res.send(500, err.message || err.errmsg);
      }
      if (type) {
        return res.send(204);
      }
      return res.send(410, 'cannot find type ' + req.params.id);
    });
  });
};
