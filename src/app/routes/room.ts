import * as express from 'express';

import path = require('path');

interface BuildingConfig {
  frib: any;
  nscl: any;
  srf: any;
}

let building: BuildingConfig;

export function setBuildingConfig(config: BuildingConfig) {
  building = config;
}

export function init(app: express.Application) {
  app.get('/:building/rooms', function(req, res) {
    res.render('room', {
      json: path.join(req.path, '/json'),
    });
  });

  app.get('/:building/rooms/json', function(req, res) {
    res.json(building[req.params.building]);
  });
}
