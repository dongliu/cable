var wbs = require('../config/wbs.json');

module.exports = function (app) {
  app.get('/wbs', function(req, res) {
    res.render('wbs', {wbs: wbs});
  });

  app.get('/wbs/all', function(req, res) {
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
};

function findChild(object, childNumber) {
  for (var i = 0; i < object.children.length; i += 1) {
    if (object.children[i].number === childNumber) {
      return object.children[i];
    }
  }
  return null;
}