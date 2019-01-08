const frib = require('../../config/wbs.json');
const rea6 = require('../../config/rea6.json');
const wbs = {frib: frib, rea6: rea6};
import path = require('path');

export default function(app) {
  app.get('/:project/wbs', function(req, res) {
    res.render('wbs', {project: req.params.project, json: path.join(req.path, '/json')});
  });

  app.get('/:project/wbs/json', function(req, res) {
    res.json(wbs[req.params.project]);
  });

  app.get('/:project/wbs/:number', function(req, res) {
    const parts = req.params.number.split('.');
    let key = parts[0];
    let locator = findChild(wbs[req.params.project], key);
    if (locator === null) {
       return res.json(null);
    }

    for (let i = 1; i < parts.length; i += 1) {
      key = key + '.' + parts[i];
      locator = findChild(locator, key);
      if (locator === null) {
         return res.json(null);
      }
    }
    res.json(locator);
  });
}

function findChild(object, childNumber) {
  for (let i = 0; i < object.children.length; i += 1) {
    if (object.children[i].number === childNumber) {
      return object.children[i];
    }
  }
  return null;
}
