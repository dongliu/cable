
var mongoose = require('mongoose');
var CableType = mongoose.model('CableType');

var auth = require('../lib/auth');


module.exports = function(app) {
  app.get('/cabletypes', auth.ensureAuthenticated, function(req, res) {
    res.render('cabletype', {roles: req.session.roles});
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
};

