import path = require('path');

const frib = require('../../config/fribroom.json');
const nscl = require('../../config/nscl.json');
const srf = require('../../config/srfroom.json');
const building = {
  frib: frib,
  nscl: nscl,
  srf: srf,
};

export default function(app) {
  app.get('/:building/rooms', function(req, res) {
    res.render('room', {
      json: path.join(req.path, '/json'),
    });
  });

  app.get('/:building/rooms/json', function(req, res) {
    res.json(building[req.params.building]);
  });
}
