var sysSub = require('../config/sys-sub.json');
var signal = require('../config/signal.json');

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var Cable = mongoose.model('Cable');

var auth = require('../lib/auth');


module.exports = function(app) {
  app.get('/request/new', auth.ensureAuthenticated, function(req, res) {
    res.render('newrequest', {
      sysSub: sysSub,
      signal: signal
    });
  });

  // create a new request
  app.post('/request', auth.ensureAuthenticated, function(req, res) {
    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }

    // console.dir(req.body);
    var request = new Request(req.body.request);
    request.createdBy = req.session.userid;
    request.createdOn = Date.now();
    request.status = 0;
    if (req.body.action == 'submit') {
      request.submittedBy = req.session.userid;
      request.submittedOn = request.createdOn;
      request.status = 1;
    }
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

  // get the request details
  app.get('/request/:id', auth.ensureAuthenticated, function(req, res) {
      return res.render('request', {
        sysSub: sysSub,
        signal: signal,
        id: req.params.id
      });
  });

  app.get('/request/:id/json', auth.ensureAuthenticated, function(req, res) {
    // Request.findById(req.params.id, function(err, cableRequest) {
    //   if (err) {
    //     return res.send(500, 'something is wrong.');
    //   }
    //   res.json(cableRequest.toObject());
    // });
  Request.findById(req.params.id).lean().exec(function(err, cableRequest) {
      if (err) {
        return res.send(500, 'something is wrong.');
      }
      res.json(cableRequest);
    });
  });

  // get the request list based on query
  app.get('/request/status/:s', function(req, res) {
    var status = parseInt(req.params.s, 10);
    if (status < 0 || status > 4) {
      return res.send(400, 'request is wrong.');
    }
    Request.find({status: status}).lean().exec(function(err, docs){
      if (err) {
        return res.send(500, 'something is wrong.');
      }
      res.json(docs);
    });
  });


  // update a request
  app.put('/request/:id', auth.ensureAuthenticated, function(req, res) {
    var request = req.body.request;
    request.updatedBy = req.session.userid;
    request.updatedOn = Date.now();
    if (req.body.action == 'submit') {
      // cannot submitted twice
      request.submittedBy = req.session.userid;
      request.submittedOn = Date.now();
      request.status = 1;
    }
    if (req.body.action == 'adjust') {
      // check if already submitted
      request.adjustedBy = req.session.userid;
      request.adjustedOn = Date.now();
    }
    if (req.body.action == 'request') {
      // check if already adjusted
      request.requestedBy = req.session.userid;
      request.requestedOn = Date.now();
      request.status = 2;
    }
    if (req.body.action == 'reject') {
      // check if already submitted
      request.rejectedBy = req.session.userid;
      request.rejectedOn = Date.now();
      request.status = 4;
    }
    if (req.body.action == 'approve') {
      // check if already request-approval
      request.approvedBy = req.session.userid;
      request.approvedOn = Date.now();
      request.status = 3;
    }

    Request.findByIdAndUpdate(req.params.id, request).lean().exec(function(err, cableRequest) {
      if (err) {
        return res.send(500, 'something is wrong.');
      }
      res.json(cableRequest);
    });
    // res.json(req.body);
  });



  app.get('/cable/', function(req, res) {

  });

  app.get('/cable/:id', function(req, res) {

  });

  app.put('/cable/:id', function(req, res) {

  });



};