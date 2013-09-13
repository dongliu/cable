var sysSub = require('../config/sys-sub.json');
var signal = require('../config/signal.json');

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var Cable = mongoose.model('Cable');
var User = mongoose.model('User');

var auth = require('../lib/auth');


// request status
// 0: saved 1: submitted 2: approved 3: rejected

// cable status
// 0: approved 1: ordered 2: received 3: accepted 4: labeled
// 5: bench terminated 6: bench tested 7: pulled 8: field terminated
// 9: tested


//TODO need a server side validation in the future

module.exports = function(app) {
  app.get('/requests/new', auth.ensureAuthenticated, function(req, res) {
    return res.render('request', {
      sysSub: sysSub,
      signal: signal,
      roles: req.session.roles
    });
  });

  // get the requests owned by the current user
  // this is different from the request with status parameter
  // need more work when sharing is enabled
  app.get('/requests', auth.ensureAuthenticated, function(req, res) {
    Request.find({
      createdBy: req.session.userid
    }).lean().exec(function(err, requests) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(requests);
    });
  });

  app.get('/requests/json', auth.ensureAuthenticated, function(req, res) {
    Request.find({
      createdBy: req.session.userid
    }).lean().exec(function(err, requests) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(requests);
    });
  });

  // create a new request
  app.post('/requests', auth.ensureAuthenticated, function(req, res) {
    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }
    // console.dir(req.body);


    var request = new Request(req.body.request);

    if (req.body.action === 'clone') {
      request.basic.quantity = 1;
    }


    // if (req.body.action === 'clone') {
    //   if (!req.body.hasOwnProperty('copyFrom')){
    //     return res.send(400, 'need the request id');
    //   }
    //   Request.findById(req.body.copyFrom).lean().exec(function(err, cableRequest){
    //     if (err) {
    //       console.erroe(err.msg);
    //       return res.send(500, 'cannot find the original request to clone');
    //     } else {
    //       request = new Request();
    //       request.basic = cableRequest.basic;
    //       request.from = cableRequest.from;
    //       request.to = cableRequest.to;
    //       request.comments = cableRequest.comments;
    //       // request.createdBy = req.session.userid;
    //       // request.createdOn = Date.now();
    //       // request.status = 0;
    //     }
    //   });
    // } else {
    //   request = new Request(req.body.request);
    // }
    // set new request attribute

    request.createdBy = req.session.userid;
    request.createdOn = Date.now();
    request.status = 0;

    if (req.body.action === 'submit') {
      request.submittedBy = req.session.userid;
      request.submittedOn = request.createdOn;
      request.status = 1;
    }
    // console.log(request.inspect());
    request.save(function(err, cableRequest) {
      if (err) {
        console.error(err.msg);
        return res.send(500, 'something is wrong.');
      }
      var url = req.protocol + '://' + req.get('host') + '/requests/' + cableRequest.id;
      res.set('Location', url);
      res.json(201, {
        location: '/requests/' + cableRequest.id
      });
    });
  });

  // get the request details
  // add authorization check here
  app.get('/requests/:id', auth.ensureAuthenticated, function(req, res) {
    return res.render('request', {
      sysSub: sysSub,
      signal: signal,
      id: req.params.id,
      roles: req.session.roles
    });
  });

  app.get('/requests/:id/json', auth.ensureAuthenticated, function(req, res) {
    Request.findById(req.params.id).lean().exec(function(err, cableRequest) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      res.json(cableRequest);
    });
  });

  // get the request list based on query
  // a user can only view the requests created by her/him self
  app.get('/requests/statuses/:s/json', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.length === 0) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var status = parseInt(req.params.s, 10);
    if (status < 0 || status > 4) {
      return res.json(400, {
        error: 'wrong status'
      });
    }
    var query;
    // This needs to be changed if sharing is enabled
    if (status === 0) {
      query = {
        createdBy: req.session.userid,
        status: status
      };
    } else {
      query = {
        status: status
      };
    }
    Request.find(query).lean().exec(function(err, docs) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(docs);
    });
  });


  // update a request
  app.put('/requests/:id', auth.ensureAuthenticated, function(req, res) {
    var request = req.body.request;
    request.updatedBy = req.session.userid;
    request.updatedOn = Date.now();
    if (req.body.action == 'submit') {
      // cannot submitted twice
      request.submittedBy = req.session.userid;
      request.submittedOn = Date.now();
      request.status = 1;
    }
    // if (req.body.action == 'adjust') {
    //   // check if already submitted
    //   request.adjustedBy = req.session.userid;
    //   request.adjustedOn = Date.now();
    // }
    // if (req.body.action == 'request') {
    //   // check if already adjusted
    //   request.requestedBy = req.session.userid;
    //   request.requestedOn = Date.now();
    //   request.status = 2;
    // }
    if (req.body.action == 'reject') {
      // check if already submitted
      request.rejectedBy = req.session.userid;
      request.rejectedOn = Date.now();
      request.status = 3;
    }
    if (req.body.action == 'approve') {
      // check if already request-approval
      request.approvedBy = req.session.userid;
      request.approvedOn = Date.now();
      request.status = 2;
    }

    Request.findByIdAndUpdate(req.params.id, request).lean().exec(function(err, cableRequest) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      if (req.body.action !== 'approve') {
        res.send(204);
      } else {
        createCable(cableRequest, req, res, cableRequest.basic.quantity);
      }
    });
  });



  app.get('/cables', function(req, res) {
    Cable.find({
      submittedBy: req.session.userid
    }).lean().exec(function(err, cables) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(cables);
    });
  });


  // get the current user's cables
  app.get('/cables/json', function(req, res) {
    Cable.find({
      submittedBy: req.session.userid
    }).lean().exec(function(err, cables) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(cables);
    });
  });

  app.get('/cables/statuses/:s/json', function(req, res) {
    if (req.session.roles.length === 0) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var status = parseInt(req.params.s, 10);
    if (status < 0 || status > 3) {
      return res.json(400, {
        error: 'wrong status'
      });
    }
    var query = {
      status: status
    };
    Cable.find(query).lean().exec(function(err, docs) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(docs);
    });
  });

  app.get('/cables/:id', function(req, res) {
    return res.render('cable', {
      id: req.params.id
    });
  });

  app.get('/cables/:id/json', auth.ensureAuthenticated, function(req, res) {
    Cable.findOne({
      number: req.params.id
    }).lean().exec(function(err, cable) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      res.json(cable);
    });
  });

  app.put('/cables/:id', function(req, res) {

  });
};


function createCable(cableRequest, req, res, quantity) {
  var sss = cableRequest.basic.system + cableRequest.basic.subsystem + cableRequest.basic.signal;
  Cable.findOne({
    number: {
      $regex: '^' + sss + '\\d{6}'
    }
  }, 'number', {
    sort: {
      number: -1
    }
  }).lean().exec(function(err, cable) {
    var nextNumber;
    if (err) {
      console.error(err.msg);
      // revert the request state?
      return res.json(500, {
        error: err.msg
      });
    } else {
      console.dir(cable);
      if (cable) {
        nextNumber = increment(cable.number);
      } else {
        nextNumber = sss + '000000';
      }
      console.log(nextNumber);
      var newCable = new Cable({
        number: nextNumber,
        status: 0,
        request_id: cableRequest._id,
        // basic: cableRequest.basic,
        // from: cableRequest.from,
        // to: cableRequest.to,
        // routing: cableRequest.routing,
        // other: cableRequest.other,
        submittedBy: cableRequest.submittedBy,
        submittedOn: cableRequest.submittedOn,
        approvedBy: req.session.userid,
        approvedOn: Date.now(),
      });
      newCable.save(function(err, doc) {
        if (err && err.code) {
          console.dir(err);
          // see test/duplicatedCableNumber.js for a test of this case
          if (err.code == 11000) {
            console.log(nextNumber + ' already existed, try again ...');
            createCable(cableRequest, req, res, quantity);
          } else {
            console.error(err.msg);
            return res.json(500, {
              error: err.msg
            });
          }
        } else {
          if (quantity === 1) {
            var url = req.protocol + '://' + req.get('host') + '/cables/' + nextNumber;
            res.set('Location', url);
            return res.json(201, {
              location: '/cables/' + nextNumber
            });
          } else {
            createCable(cableRequest, req, res, quantity - 1);
          }
        }
      });
    }
  });
}

function increment(number) {
  var sequence = parseInt(number.substring(3), 10);
  if (sequence == 999999) {
    return null;
  }
  return number.substring(0, 3) + pad(sequence + 1);
}

function pad(num) {
  var s = '' + num;
  if (s.length >= 6) {
    return s;
  } else {
    s = '000000' + s;
    return s.substring(s.length - 6);
  }
}