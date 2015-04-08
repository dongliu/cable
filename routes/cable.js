/*jslint es5: true*/

var sysSub = require('../config/sys-sub.json');

var mongoose = require('mongoose');
var Request = mongoose.model('Request');
var Cable = mongoose.model('Cable');
var User = mongoose.model('User');

var util = require('util');

var auth = require('../lib/auth');

var querystring = require('querystring');


// request status
// 0: saved 1: submitted 2: approved 3: rejected

// cable status
// procuring
//   100: approved 101: ordered 102: received 103: accepted
// installing
//   200: ready for installation 201: labeled 202: bench terminated 203: bench tested 249: ready for pull 250: pulled 251: field terminated 252: field tested
// working: 3xx
// failed: 4xx
// aborted: 5xx
//   501: not required


//TODO: need a server side validation in the future

function pad(num) {
  var s = num.toString();
  if (s.length === 6) {
    return s;
  }
  s = '000000' + s;
  return s.substring(s.length - 6);
}

function increment(number) {
  var sequence = parseInt(number.substring(3), 10);
  if (sequence === 999999) {
    return null;
  }
  return number.substring(0, 3) + pad(sequence + 1);
}

function createCable(cableRequest, req, res, quantity, cables) {
  var sss = cableRequest.basic.originCategory + cableRequest.basic.originSubcategory + cableRequest.basic.signalClassification;
  Cable.findOne({
    number: {
      $regex: '^' + sss + '\\d{6}'
    }
  }, 'number', {
    sort: {
      number: -1
    }
  }).lean().exec(function (err, cable) {
    var nextNumber;
    if (err) {
      console.error(err.msg);
      // revert the request state?
      return res.send(500, err.msg);
    }
    if (cable) {
      nextNumber = increment(cable.number);
    } else {
      nextNumber = sss + '000000';
    }
    // console.log(nextNumber);
    var newCable = new Cable({
      number: nextNumber,
      status: 100,
      request_id: cableRequest._id,
      tags: cableRequest.basic.tags,
      basic: cableRequest.basic,
      from: cableRequest.from,
      to: cableRequest.to,
      required: cableRequest.required,
      comments: cableRequest.comments,
      length: cableRequest.length,
      conduit: cableRequest.conduit,
      routing: cableRequest.routing,
      submittedBy: cableRequest.submittedBy,
      submittedOn: cableRequest.submittedOn,
      approvedBy: req.session.userid,
      approvedOn: Date.now(),
    });
    newCable.save(function (err, doc) {
      if (err) {
        console.dir(err);
        // see test/duplicatedCableNumber.js for a test of this case
        if (err.code && err.code === 11000) {
          console.log(nextNumber + ' already existed, try again ...');
          createCable(cableRequest, req, res, quantity, cables);
        } else {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
      } else {
        console.log('new cable ' + nextNumber + ' was created.');
        cables.push(doc.toJSON());
        if (quantity === 1) {
          return res.json(200, {
            request: cableRequest,
            cables: cables
          });
        }
        createCable(cableRequest, req, res, quantity - 1, cables);
      }
    });
  });
}

module.exports = function (app) {
  app.get('/requests/new', auth.ensureAuthenticated, function (req, res) {
    return res.render('request', {
      sysSub: sysSub,
      roles: req.session.roles
    });
  });

  // get the requests owned by the current user
  // this is different from the request with status parameter
  // need more work when sharing is enabled
  app.get('/requests', auth.ensureAuthenticated, function (req, res) {
    Request.find({
      createdBy: req.session.userid
    }).lean().exec(function (err, requests) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(requests);
    });
  });

  app.get('/requests/json', auth.ensureAuthenticated, function (req, res) {
    Request.find({
      createdBy: req.session.userid
    }).lean().exec(function (err, requests) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(requests);
    });
  });

  // create a new request from a form or clone
  app.post('/requests/', auth.ensureAuthenticated, function (req, res) {
    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }
    var request = {};
    var requests = [];
    var i;
    if (req.body.request) {
      request = req.body.request;
      if (req.body.action === 'clone') {
        request.basic.quantity = 1;
      }
      request.createdBy = req.session.userid;
      request.createdOn = Date.now();
      request.status = 0;

      // limit the max number of a clone request to 21
      if (req.body.quantity && req.body.quantity > 1 && req.body.quantity < 21) {
        for (i = 0; i < req.body.quantity; i += 1) {
          requests.push(request);
        }
        Request.create(requests, function (err) {
          if (err) {
            console.dir(err);
            res.send(500, err.msg);
          } else {
            res.send(201, req.body.quantity + ' requests created');
          }
        });
      } else if (req.body.quantity && req.body.quantity >= 21) {
        res.send(400, 'the quantity needs to be less than 21.');
      } else {
        (new Request(request)).save(function (err, cableRequest) {
          if (err) {
            console.error(err.msg);
            return res.send(500, err.msg);
          }
          var url = req.protocol + '://' + req.get('host') + '/requests/' + cableRequest.id;
          res.set('Location', url);
          res.json(201, {
            location: '/requests/' + cableRequest.id
          });
        });
      }
    } else {
      res.send(400, 'need request description');
    }
  });

  // get the request details
  // add authorization check here
  app.get('/requests/:id/', auth.ensureAuthenticated, function (req, res) {
    return res.render('request', {
      sysSub: sysSub,
      id: req.params.id,
      roles: req.session.roles
    });
  });

  app.delete('/requests/:id/', auth.ensureAuthenticated, function (req, res) {
    Request.findById(req.params.id).exec(function (err, request) {
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
        request.remove(function (err) {
          if (err) {
            console.error(err.msg);
            return res.send(500, err.msg);
          }
          return res.send(200, 'deleted');
        });
      } else {
        return res.send(410, 'gone');
      }

    });
  });

  app.get('/requests/:id/json', auth.ensureAuthenticated, function (req, res) {
    Request.findById(req.params.id).lean().exec(function (err, cableRequest) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      res.json(cableRequest);
    });
  });

  app.get('/requests/:id/details', auth.ensureAuthenticated, function (req, res) {
    Request.findById(req.params.id).lean().exec(function (err, cableRequest) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      if (cableRequest) {
        res.render('requestdetails', {
          request: cableRequest
        });
      } else {
        res.send(410, 'The request ' + req.params.id + ' is gone.');
      }
    });
  });

  // get the request list based on query
  // a manager can only view the saved requests that has his wbs numbers

  function findRequest(query, res) {
    Request.find(query).lean().exec(function (err, docs) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(docs);
    });
  }

  app.get('/requests/statuses/:s/json', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || (req.session.roles.indexOf('manager') === -1 && req.session.roles.indexOf('admin') === -1)) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var status = parseInt(req.params.s, 10);
    if (status < 0 || status > 4) {
      return res.send(400, 'the status ' + status + ' is invalid.');
    }
    var query;
    // admin see all
    if (req.session.roles.indexOf('admin') !== -1) {
      query = {
        status: status
      };
      findRequest(query, res);
    } else {
      // manager see his own wbs
      User.findOne({
        adid: req.session.userid
      }).lean().exec(function (err, user) {
        if (err) {
          console.error(err.msg);
          return res.send(500, err.msg);
        }
        if (!user) {
          return res.send(404, 'cannot identify you.');
        }
        if (user.wbs === undefined || user.wbs.length === 0) {
          return res.json([]);
        }
        query = {
          'basic.wbs': {
            $in: user.wbs
          },
          status: status
        };
        findRequest(query, res);
      });
    }
  });

  function authorize(req, res, next) {
    var roles = req.session.roles;
    var action = req.body.action;
    if (!req.body.action) {
      return res.send(400, 'no action found.');
    }
    if (action === 'adjust' || action === 'approve' || action === 'reject') {
      if (roles.length === 0 || roles.indexOf('manager') === -1) {
        return res.send(404, 'You are not authorized to modify this resource. ');
      }
      // assume no way to guess the request id
      next();
    } else if (action === 'save' || action === 'submit' || action === 'revert') {
      // assume no way to guess the request id
      next();
    } else {
      return res.send(400, 'action not understood.');
    }
  }

  // update a request
  app.put('/requests/:id/', auth.ensureAuthenticated, authorize, function (req, res) {
    var request = req.body.request || {};
    request.updatedBy = req.session.userid;
    request.updatedOn = Date.now();

    if (req.body.action === 'save') {
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 0
      }, request, function (err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' gone');
        return res.json(410, {
          error: req.params.id + ' gone'
        });
      });
    }

    if (req.body.action === 'submit') {
      // cannot submitted twice
      request.submittedBy = req.session.userid;
      request.submittedOn = Date.now();
      request.status = 1;

      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 0
      }, request, function (err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' cannot be submitted');
        return res.json(410, {
          error: req.params.id + ' cannot be submitted'
        });
      });
    }

    if (req.body.action === 'revert') {
      request.revertedBy = req.session.userid;
      request.revertedOn = Date.now();
      request.status = 0;

      console.dir(request);
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request, function (err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' cannot be reverted');
        return res.json(400, {
          error: req.params.id + ' cannot be reverted'
        });
      });
    }

    if (req.body.action === 'adjust') {
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request, function (err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' gone');
        return res.json(410, {
          error: req.params.id + ' gone'
        });
      });
    }

    if (req.body.action === 'reject') {
      request.rejectedBy = req.session.userid;
      request.rejectedOn = Date.now();
      request.status = 3;
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request, function (err, cableRequest) {
        if (err) {
          console.error(err.msg);
          return res.json(500, {
            error: err.msg
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' gone');
        return res.json(410, {
          error: req.params.id + ' gone'
        });
      });
    }

    if (req.body.action === 'approve') {
      request.approvedBy = req.session.userid;
      request.approvedOn = Date.now();
      request.status = 2;
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1
      }, request).lean().exec(
        function (err, cableRequest) {
          if (err) {
            console.error(err.msg);
            return res.json(500, {
              error: err.msg
            });
          }
          if (cableRequest) {
            createCable(cableRequest, req, res, cableRequest.basic.quantity, []);
          } else {
            console.error(req.params.id + ' gone');
            return res.json(410, {
              error: req.params.id + ' gone'
            });
          }
        }
      );
    }

  });



  app.get('/cables', auth.ensureAuthenticated, function (req, res) {
    Cable.find({
      submittedBy: req.session.userid
    }).lean().exec(function (err, cables) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(cables);
    });
  });


  // get the user's cables
  app.get('/cables/json', auth.ensureAuthenticated, function (req, res) {
    Cable.find({
      submittedBy: req.session.userid
    }).lean().exec(function (err, cables) {
      if (err) {
        return res.json(500, {
          error: err.msg
        });
      }
      return res.json(cables);
    });
  });


  // status: 1 for procuring, 2 for installing, 3 for installed

  app.get('/cables/statuses/:s/json', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || (req.session.roles.indexOf('manager') === -1 && req.session.roles.indexOf('admin') === -1)) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var status = parseInt(req.params.s, 10);
    if (status < 0 || status > 5) {
      return res.json(400, {
        error: 'wrong status'
      });
    }

    if (status === 0) {
      if (req.session.roles.indexOf('admin') !== -1) {
        // get all the cables
        Cable.find({}).lean().exec(function (err, docs) {
          if (err) {
            console.error(err.msg);
            return res.json(500, {
              error: err.msg
            });
          }
          return res.json(docs);
        });
      } else {
        return res.send(403, "Only admin can access this resource. ");
      }
    } else {
      var low = status * 100;
      var up = status * 100 + 99;
      if (req.session.roles.indexOf('admin') !== -1) {
        Cable.where('status').gte(low).lte(up).lean().exec(function (err, docs) {
          if (err) {
            console.error(err.msg);
            return res.json(500, {
              error: err.msg
            });
          }
          return res.json(docs);
        });
      } else {
        // manager see his own wbs
        User.findOne({
          adid: req.session.userid
        }).lean().exec(function (err, user) {
          if (err) {
            console.error(err.msg);
            return res.send(500, err.msg);
          }
          if (!user) {
            return res.send(404, 'cannot identify you.');
          }
          if (user.wbs === undefined || user.wbs.length === 0) {
            return res.json([]);
          }

          Cable.where('status').gte(low).lte(up).where('basic.wbs').in(user.wbs).lean().exec(function (err, docs) {
            if (err) {
              console.error(err.msg);
              return res.json(500, {
                error: err.msg
              });
            }
            return res.json(docs);
          });
        });
      }
    }
  });

  app.get('/cables/:id/', auth.ensureAuthenticated, function (req, res) {
    Cable.findOne({
      number: req.params.id
    }).lean().exec(function (err, cable) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      if (cable) {
        return res.render('cable', {
          cable: cable,
          fs: {
            formatCableStatus: function (s) {
              var status = {
                '100': 'approved',
                '101': 'ordered',
                '102': 'received',
                '103': 'accepted',
                '200': 'to install',
                '201': 'labeled',
                '202': 'bench terminated',
                '203': 'bench tested',
                '249': 'to pull',
                '250': 'pulled',
                '251': 'field terminated',
                '252': 'field tested',
                '300': 'working',
                '400': 'failed',
                '500': 'aborted'
              };
              if (status[s.toString()]) {
                return status[s.toString()];
              }
              return 'unknown';
            },
            encodeName: function (s) {
              return querystring.stringify({
                name: s
              });
            },
            json2List: function (json) {
              var output = '<dl>';
              var k;
              for (k in json) {
                if (json.hasOwnProperty(k)) {
                  output = output + '<p>' + k + ' : ' + json[k] + '</p>';
                }
              }
              output = output + '</dl>';
              return output;
            }
          }
        });
      }
      return res.send(403, 'cannot find cable ' + req.params.id);
    });

  });

  app.get('/cables/:id/json', auth.ensureAuthenticated, function (req, res) {
    Cable.findOne({
      number: req.params.id
    }).lean().exec(function (err, cable) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      res.json(cable);
    });
  });

  app.put('/cables/:id', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles.length === 0 || req.session.roles.indexOf('manager') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    var conditions = {
      number: req.params.id
    };
    var update = {};
    var inValidaAction = false;

    var required = req.body.required;

    switch (req.body.action) {
    case "order":
      update.status = 101;
      update.orderedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.orderedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "receive":
      update.status = 102;
      update.receivedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.receivedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "accept":
      update.status = 103;
      update.orderedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.orderedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "install":
      update.status = 200;
      break;
    case "label":
      conditions.status = {
        $gte: 200
      };
      update.status = 201;
      update.labeledBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.labeledOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "benchTerm":
      conditions.status = {
        $gte: 200
      };
      update.status = 202;
      update.benchTerminatedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.benchTerminatedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "benchTest":
      conditions.status = {
        $gte: 200
      };
      update.status = 203;
      update.benchTestedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.benchTestedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "pull":
      // check required steps
      conditions.status = {
        $gte: 200
      };
      if (required && required.label) {
        conditions.labeledBy = {
          $exists: true
        };
      }
      if (required && required.benchTerm) {
        conditions.benchTerminatedBy = {
          $exists: true
        };
      }
      if (required && required.benchTest) {
        conditions.benchTestedBy = {
          $exists: true
        };
      }
      update.status = 249;
      break;
    case "pulled":
      conditions.status = 249;
      update.status = 250;
      update.pulledBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.pulledOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "fieldTerm":
      conditions.status = {
        $gte: 250
      };
      update.status = 251;
      update.fieldTerminatedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.fieldTerminatedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "fieldTest":
      conditions.status = {
        $gte: 250
      };
      if (required && required.fieldTerm) {
        conditions.fieldTerminatedBy = {
          $exists: true
        };
      }
      update.status = 252;
      update.fieldTestedBy = (req.body.name === '') ? req.session.username : req.body.name;
      update.fieldTestedOn = (req.body.date === '') ? Date.now() : Date(req.body.date);
      break;
    case "use":
      // check required steps
      conditions.status = 252;
      if (required && required.fieldTerm) {
        conditions.fieldTerminatedBy = {
          $exists: true
        };
      }
      conditions.fieldTestedBy = {
        $exists: true
      };
      update.status = 300;
      break;
    default:
      inValidaAction = true;
    }
    if (inValidaAction) {
      res.send(400, 'invalid action');
    }
    update.updatedOn = Date.now();
    update.updatedBy = req.session.userid;
    Cable.findOneAndUpdate(conditions, update, function (err, cable) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      if (cable) {
        return res.json(200, cable.toJSON());
      }
      console.error(req.params.id + ' with conditions for the update cannot be found');
      return res.send(409, req.params.id + ' state, requirements and the update conflicted');
    });

  });
};
