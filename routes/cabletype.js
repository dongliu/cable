var mongoose = require('mongoose');
var CableType = mongoose.model('CableType');

var auth = require('../lib/auth');


module.exports = function(app) {
  app.get('/cabletypes', auth.ensureAuthenticated, function(req, res) {
    res.render('cabletype', {
      roles: req.session.roles
    });
  });

  app.get('/cabletypes/manage', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.indexOf('admin') !== -1) {
      return res.render('cabletypemgmt');
    } else {
      return res.send(403, 'You are not authorized to access this resource');
    }
  });

  app.get('/cabletypes/json', auth.ensureAuthenticated, function(req, res) {
    CableType.find(function(err, docs) {
      if (err) {
        return res.send(500, err.message);
      }
      res.json(docs);
    });
  });

  app.post('/cabletypes', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('manage') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var newType = {
      name: req.body.name || 'updateme',
      characteristics: req.body.characteristics || '',
      diameter: req.diameter || '',
      service: req.service || '',
      voltage: req.voltage || '',
      insulation: req.insulation || '',
      jacket: req.jacket || '',
      raceway: req.raceway || '',
      tid: req.tid || '',
      model: req.model || '',
      comments: req.comments || '',
      spec: req.spec || ''
    };
    (new CableType(newType)).save(function(err, type) {
      if (err && err.code) {
        // console.dir(err);
        // see test/duplicatedCableNumber.js for a test of this case
        if (err.code == 11000) {
          console.log(err.msg || err.errmsg);
          return res.send(400, 'please update the cable type named 0updateme');
        } else {
          console.error(err.msg || err.errmsg);
          return res.send(500, err.msg || err.errmsg);
        }
      }
      var url = req.protocol + '://' + req.get('host') + '/cabletypes/' + type._id;
      res.set('Location', url);
      return res.json(201, type);
    });
  });

  app.put('/cabletypes/:id', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('manage') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var conditions = {
      _id: req.params.id
    };
    conditions[req.body.target] = req.body.original;
    var update = {};
    update[req.body.target] = req.body.update;
    update['updatedOn'] = Date.now();
    update['updatedBy'] = req.session.userid;
    CableType.findOneAndUpdate(conditions, update, function(err, type) {
      // the err is not a mongoose error
      if (err) {
        if (err.errmsg) {
          console.dir(err.errmsg);
        }
        if (err.lastErrorObject && err.lastErrorObject.code == 11001) {
          return res.send(400, req.body.update + ' is used');
        } else {
          return res.send(500, err.msg || err.errmsg);
        }
      }
      if (type) {
        return res.send(204);
      } else {
        return res.send(410, 'cannot find type ' + req.params.id);
      }
    });
  });
};