var wbs = require('../config/wbs.json');
var rea6wbs = require('../config/rea6.json');

module.exports = function (app) {
  app.get('/wbs', function(req, res) {
    res.render('wbs', {project: 'FRIB', json: '/wbs/json'});
  });

  app.get('/wbs/json', function(req, res) {
    res.json(wbs);
  });

  app.get('/wbs/:number', function(req, res) {
    var parts = req.params.number.split('.');
    var key = parts[0];
    var locator = findChild(wbs, key);
    if (locator == null) {
       return res.json(null);
    }

    for (var i = 1; i < parts.length; i += 1) {
      key = key + '.' + parts[i];
      locator = findChild(locator, key);
      if (locator == null) {
         return res.json(null);
      }
    }
    res.json(locator);
  });

  app.get('/rea6-wbs', function(req, res) {
    res.render('wbs', {project: 'ReA 6', json: '/rea6-wbs/json'});
  });

  app.get('/rea6-wbs/json', function(req, res) {
    res.json(rea6wbs);
  });
};

function findChild(object, childNumber) {
  for (var i = 0; i < object.children.length; i += 1) {
    if (object.children[i].number === childNumber) {
      return object.children[i];
    }
  }
  return null;
}