var sysSub = require('../config/sys-sub.json');
var signal = require('../config/signal.json');

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var Cable = mongoose.model('Cable');
var User = mongoose.model('User');

var util = require('util');

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
    var request = {};
    if (req.body.requests) {
      // console.log(req.body.requests);
      if (!util.isArray(req.body.requests)) {
        res.send(400, 'requests should be an array');
      } else {
        var requests = [];
        for (var i = 0; i < req.body.requests.length; i += 1) {
          // request = new Request(req.body.request);
          request.basic = req.body.requests[i].basic;
          request.from = req.body.requests[i].from;
          request.to = req.body.requests[i].to;

          if (req.body.action === 'clone') {
            request.basic.quantity = 1;
          }

          request.createdBy = req.session.userid;
          request.createdOn = Date.now();
          request.status = 0;

          if (req.body.action === 'submit') {
            request.submittedBy = req.session.userid;
            request.submittedOn = request.createdOn;
            request.status = 1;
          }

          requests.push(request);
        }
        Request.create(requests, function(err) {
          if (err) {
            console.err(err.msg);
            res.send(500, err.msg);
          } else {
            res.send(201, '' + (arguments.length - 1) + ' requests created');
          }
        });
      }

    } else if (req.body.request && !util.isArray(req.body.request)) {
      request = new Request(req.body.request);

      if (req.body.action === 'clone') {
        request.basic.quantity = 1;
      }

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
    } else {
      res.send(400, 'need request description');
    }

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

  app.delete('/requests/:id', auth.ensureAuthenticated, function(req, res) {
    Request.findById(req.params.id).exec(function(err, request) {
      if (err) {
        console.error(err.msg);
        return res.send(500, err.msg);
      }
      if (request) {
        if (req.session.userid !== request.createdBy) {
          return res.send(403, 'current user is not allowed to delete this resource');
        }
        if (request.status === 1 || request.status === 2) {
          return res.send(400, 'this resource is not allowed to be deleted');
        }
        request.remove(function(err) {
          if (err) {
            console.error(err.msg);
            return res.send(500, err.msg);
          }
          return res.send(200, 'deleted');
        });
      } else {
        return res.send(410, 'already gone');
      }

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
    var roles = req.session.roles;
    var request = req.body.request;
    request.updatedBy = req.session.userid;
    request.updatedOn = Date.now();

    if (!req.body.action) {
      res.send(400, 'do not know you want to do');
    }

    if (req.body.action == 'save') {
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 0
      }, request, function(err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.send(204);
        } else {
          console.error(req.params.id + ' gone');
          return res.json(410, {
            error: req.params.id + ' gone'
          });
        }
      });
    }

    if (req.body.action == 'submit') {
      // cannot submitted twice
      request.submittedBy = req.session.userid;
      request.submittedOn = Date.now();
      request.status = 1;

      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 0
      }, request, function(err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.send(204);
        } else {
          console.error(req.params.id + ' gone');
          return res.json(410, {
            error: req.params.id + ' gone'
          });
        }
      });
    }
    if (req.body.action == 'adjust') {
      if (roles.length === 0 || roles.indexOf('manage') === -1) {
        res.send(403, "You are not authorized to access this resource. ");
      }
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request, function(err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.send(204);
        } else {
          console.error(req.params.id + ' gone');
          return res.json(410, {
            error: req.params.id + ' gone'
          });
        }
      });
    }
    // if (req.body.action == 'request') {
    //   // check if already adjusted
    //   request.status = 2;
    // }
    if (req.body.action == 'reject') {
      if (roles.length === 0 || roles.indexOf('manage') === -1) {
        res.send(403, "You are not authorized to access this resource. ");
      }
      request.rejectedBy = req.session.userid;
      request.rejectedOn = Date.now();
      request.status = 3;
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request, function(err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.send(204);
        } else {
          console.error(req.params.id + ' gone');
          return res.json(410, {
            error: req.params.id + ' gone'
          });
        }
      });
    }
    if (req.body.action == 'approve') {
      if (roles.length === 0 || roles.indexOf('manage') === -1) {
        res.send(403, "You are not authorized to access this resource. ");
      }
      request.approvedBy = req.session.userid;
      request.approvedOn = Date.now();
      request.status = 2;
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request, function(err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          createCable(cableRequest, req, res, cableRequest.basic.quantity);
        } else {
          console.error(req.params.id + ' gone');
          return res.json(410, {
            error: req.params.id + ' gone'
          });
        }
      });
    }

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