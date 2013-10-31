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

  app.put('/cabletypes/:id', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('manage') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var conditions = {_id: req.params.id};
    conditions[req.body.target] = req.body.original;
    var update = {};
    update[req.body.target] = req.body.update;
    update['updatedOn'] = Date.now();
    update['updatedBy'] = req.session.userid;
    CableType.findOneAndUpdate(conditions, update).lean().exec(function(err, type) {
      if (err && err.code) {
        console.error(err.msg);
        if (err.code == 11000) {
          return res.send(400, 'cable name needs to be unique');
        } else {
          return res.send(500, err.msg);
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