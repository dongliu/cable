var room = require('../config/fribroom.json');

module.exports = function (app) {
  app.get('/rooms', function(req, res) {
    res.render('room', {room: room});
  });

  app.get('/rooms/json', function(req, res) {
    res.json(room);
  });
};

