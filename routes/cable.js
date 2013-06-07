var sysSub = require('../config/sys-sub.json');
var signal = require('../config/signal.json');

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var Cable = mongoose.model('Cable');


module.exports = function(app) {
  app.get('/requestform', function(req, res) {
    res.render('requestform', {
      sysSub: sysSub,
      signal: signal
    });
  });

// create a new request
  app.post('/request', function(req, res) {
    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }

    var request = new Request(req.body);

    request.save(function(err, cableRequest){
      if (err) {
        console.error(err.msg);
        return res.send(500, 'something is wrong.');
      }
      var url = req.prptocol + '://' + req.get('host') + '/request/' + cableRequest.id;
      res.set('Location', url);
      res.send(201, 'The created request is at ' + url);
    });
  });

// get the request list
  app.get('/request/:status', function(req, res) {

  });

// get the request details
  app.get('/request/:id', function(req, res) {

  });


// update a request
  app.put('/request/:id', function(req, res) {

  });



  app.get('/cable/:status', function(req, res) {

  });

  app.get('/cable/:id', function(req, res) {

  });

  app.put('/cable/:id', function(req, res) {

  });



};