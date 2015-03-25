var mongoose = require('mongoose');
var CableType = mongoose.model('CableType');

var auth = require('../lib/auth');

var util = require('../lib/util');

module.exports = function (app) {
  app.get('/cabletypes', auth.ensureAuthenticated, function (req, res) {
    res.render('cabletype', {
      roles: req.session.roles
    });
  });

  app.get('/cabletypes/manage', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles.indexOf('admin') !== -1) {
      return res.render('cabletypemgmt');
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

  app.post('/cabletypes', auth.ensureAuthenticated, util.filterBody(['conductorNumber', 'conductorSize', 'fribType', 'typeNumber']), function (req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('admin') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var newType = {
      service: req.body.service,
      conductorNumber: req.conductorNumber,
      conductorSize: req.conductorSize,
      fribType: req.fribType,
      typeNumber: req.typeNumber,
      pairing: req.pairing,
      shielding: req.shielding,
      outerDiameter: req.outerDiameter,
      voltageRating: req.voltageRating,
      raceway: req.raceway,
      tunnelHotcell: req.tunnelHotcell,
      otherRequirements: req.otherRequirements,
      createBy: req.session.userid,
      createdOn: Date.now()
    };


    // generate the type name here
    newType.name = newType.conductorNumber + 'C_' + newType.conductorSize + '_' + newType.fribType + '_' + newType.typeNumber;

    (new CableType(newType)).save(function (err, type) {
      if (err) {
        console.dir(err);
        if (err.code && err.code === 11000) {
          console.error(err.msg || err.err);
          return res.send(400, 'The type name ' + newType.name + ' was already used.');
        }
        console.error(err.msg || err.err);
        return res.send(500, err.msg || err.err);
      }
      var url = req.protocol + '://' + req.get('host') + '/cabletypes/' + type._id;
      res.set('Location', url);
      return res.send(201, 'A new cable type is created at <a href="' + url + '"">' + url + '</a>');
    });
  });

  app.put('/cabletypes/:id', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('admin') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var conditions = {
      _id: req.params.id
    };
    conditions[req.body.target] = req.body.original;
    var update = {};
    update[req.body.target] = req.body.update;
    update.updatedOn = Date.now();
    update.updatedBy = req.session.userid;
    CableType.findOneAndUpdate(conditions, update, function (err, type) {
      // the err is not a mongoose error
      if (err) {
        if (err.errmsg) {
          console.dir(err.errmsg);
        }
        if (err.lastErrorObject && err.lastErrorObject.code === 11001) {
          return res.send(400, req.body.update + ' is already taken');
        }
        return res.send(500, err.msg || err.errmsg);
      }
      if (type) {
        return res.send(204);
      }
      return res.send(410, 'cannot find type ' + req.params.id);
    });
  });
};
