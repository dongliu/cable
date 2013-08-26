var path = require('path');

var frib = require('../config/fribroom.json');
var nscl = require('../config/nscl.json');
var building = {frib: frib, nscl: nscl};

module.exports = function (app) {
  app.get('/:building/rooms', function(req, res) {
    res.render('room', {json: path.join(req.path, '/json')});
  });

  app.get('/:building/rooms/json', function(req, res) {
    res.json(building[req.params.building]);
  });
};

