var sysSub = require('../config/sys-sub.json');
var signal = require('../config/signal.json');

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var Cable = mongoose.model('Cable');


module.exports = function(app) {
  app.get('/request/new', function(req, res) {
    res.render('newrequest', {
      sysSub: sysSub,
      signal: signal
    });
  });

  // create a new request
  app.post('/request', function(req, res) {
    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }

    // console.dir(req.body);
    var request = new Request(req.body);
    // console.log(request.inspect());
    request.save(function(err, cableRequest){
      if (err) {
        console.error(err.msg);
        return res.send(500, 'something is wrong.');
      }
      var url = req.protocol + '://' + req.get('host') + '/request/' + cableRequest.id;
      res.set('Location', url);
      res.json(201, {location: '/request/' + cableRequest.id});
    });
  });

  // get the request list based on query
  app.get('/request', function(req, res) {

  });

  // get the request details
  app.get('/request/:id', function(req, res) {
    // if (req.accepts('html')) {
      return res.render('request', {
        sysSub: sysSub,
        signal: signal,
        id: req.params.id
      });
    // }
  });

  app.get('/request/:id/json', function(req, res) {
    Request.findById(req.params.id, function(err, cableRequest) {
      if (err) {
        return res.send(500, 'something is wrong.');
      }
      res.json(cableRequest.toObject());
    });
  });


  // update a request
  app.put('/request/:id', function(req, res) {
    res.json(req.body);
  });



  app.get('/cable/:status', function(req, res) {

  });

  app.get('/cable/:id', function(req, res) {

  });

  app.put('/cable/:id', function(req, res) {

  });



};