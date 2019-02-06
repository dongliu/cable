/* tslint:disable:no-console */

import mongoose = require('mongoose');
//const Request = mongoose.model('Request');
const Request = require('../model/request').Request;
//const Cable = mongoose.model('Cable');
const Cable = require('../model/request').Cable;
//const MultiChange = mongoose.model('MultiChange');
const MultiChange = require('../model/request').MultiChange;
//const Change = mongoose.model('Change');
const Change = require('../model/request').Change;
//const User = mongoose.model('User');
const User = require('../model/user').User;
const auth = require('../lib/auth');

// request status
// 0: saved 1: submitted 2: approved 3: rejected

// cable status
// procuring
//   100: approved 101: ordered 102: received 103: accepted
// installing
//   200: ready for installation 201: labeled 202: bench terminated 203: bench tested 249: ready for pull 250: pulled 251: field terminated 252: field tested
// working: 3xx
// failed: 4xx
// obsoleted: 5xx
//   501: not needed


// TODO: need a server side validation in the future

let sysSub: any;

export function setSysSubData(data: any) {
  sysSub = data;
}

function pad(num) {
  let s = num.toString();
  if (s.length === 6) {
    return s;
  }
  s = '000000' + s;
  return s.substring(s.length - 6);
}

function increment(number) {
  const sequence = parseInt(number.substring(3), 10);
  if (sequence === 999999) {
    return null;
  }
  return number.substring(0, 3) + pad(sequence + 1);
}

function createCable(cableRequest, req, res, quantity, cables) {
  // fix the unspecified quantity in some requests
  if (quantity === null) {
    quantity = 1;
  }
  if (isNaN(quantity)) {
    console.log('cable request ' + cableRequest._id + 'is not a number!');
    return res.send(400, 'cable request ' + cableRequest._id + ' has a invalid quantity!');
  }

  if (quantity !== parseInt(quantity, 10)) {
    console.log('cable request ' + cableRequest._id + ' is not an integer!');
    return res.send(400, 'cable request ' + cableRequest._id + ' has a invalid quantity!');
  }

  if (quantity < 1) {
    console.log('cable request ' + cableRequest._id + ' is less than 1!');
    return res.send(400, 'cable request ' + cableRequest._id + ' has a invalid quantity!');
  }

  const sss = cableRequest.basic.originCategory + cableRequest.basic.originSubcategory + cableRequest.basic.signalClassification;
  Cable.findOne({
    number: {
      $regex: '^' + sss + '\\d{6}',
    },
  }, 'number', {
    sort: {
      number: -1,
    },
  }).lean().exec(function (err, cable) {
    let nextNumber;
    if (err) {
      console.error(err);
      // revert the request state?
      return res.send(500, err.message);
    }
    if (cable) {
      nextNumber = increment(cable.number);
    } else {
      nextNumber = sss + '000000';
    }
    // console.log(nextNumber);
    const newCable = new Cable({
      number: nextNumber,
      status: 100,
      request_id: cableRequest._id,
      tags: cableRequest.basic.tags,
      basic: cableRequest.basic,
      ownerProvided: cableRequest.ownerProvided,
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
    newCable.save(function (e, doc) {
      if (e) {
        // see test/duplicatedCableNumber.js for a test of this case
        if (e.code && e.code === 11000) {
          console.log(nextNumber + ' already existed, try again ...');
          createCable(cableRequest, req, res, quantity, cables);
        } else {
          console.error(e);
          return res.json(500, {
            error: e.message,
          });
        }
      } else {
        console.log('new cable ' + nextNumber + ' was created.');
        cables.push(doc.toJSON());
        // should be equal to 1 when return
        if (quantity < 2) {
          return res.json(200, {
            request: cableRequest,
            cables: cables,
          });
        }
        createCable(cableRequest, req, res, quantity - 1, cables);
      }
    });
  });
}

function updateCable(conditions, update, req, res) {
  Cable.findOneAndUpdate(conditions, update, {
    new: true,
  }, function (err, cable) {
    if (err) {
      console.error(err);
      return res.send(500, 'cannot save the update.');
    }
    if (cable) {
      return res.json(200, cable.toJSON());
    }
    console.error(req.params.id + ' with conditions for the update cannot be found');
    console.error(conditions);
    return res.send(409, req.params.id + ' with conditions for the update cannot be found.');
  });
}

function updateCableWithChanges(conditions, update, changes, req, res) {
  let idx = 0;
  let change = null;
  for (idx = 0; idx < changes.length; idx += 1) {
    if (changes[idx].oldValue === null) {
      // for string, treat null and '' as the same
      conditions[changes[idx].property] = {
        $in: [null, ''],
      };
    } else if (changes[idx].oldValue === false) {
      // for boolean, treat false and '' as the same
      conditions[changes[idx].property] = {
        $in: [null, false],
      };
    } else {
      conditions[changes[idx].property] = changes[idx].oldValue;
    }
    update[changes[idx].property] = changes[idx].newValue;
  }
  update.$inc = {
    __v: 1,
  };
  if (changes.length === 1) {
    change = new Change({
      cableName: req.params.id,
      property: changes[0].property,
      oldValue: changes[0].oldValue,
      newValue: changes[0].newValue,
      updatedBy: req.session.userid,
      updatedOn: Date.now(),
    });
  } else if( changes.length > 1 ) {
    change = new MultiChange({
      cableName: req.params.id,
      updates: [],
      updatedBy: req.session.userid,
      updatedOn: Date.now(),
    });
    for (idx = 0; idx < changes.length; idx += 1) {
      change.updates.push({
        property: changes[idx].property,
        oldValue: changes[idx].oldValue,
        newValue: changes[idx].newValue,
      });
    }
  }
  if (change) {
    change.save(function (err, doc) {
      if (err) {
        return res.send(500, 'cannot save the change');
      }
      update.$push = {
        changeHistory: doc._id,
      };
      updateCable(conditions, update, req, res);
    });
  } else {
      updateCable(conditions, update, req, res);
  }
}

export function init(app) {

  app.get('/manager/', auth.ensureAuthenticated, auth.verifyRoles(['admin', 'manager']), function (req, res) {
    return res.render('manager', {
      roles: req.session.roles,
    });
  });

  app.get('/manager/requests', auth.ensureAuthenticated, function (req, res) {
    return res.render('manage-requests', {
      roles: req.session.roles,
    });
  });

  app.get('/manager/cables', auth.ensureAuthenticated, function (req, res) {
    return res.render('manage-cables', {
      roles: req.session.roles,
    });
  });


  app.get('/requests/new', auth.ensureAuthenticated, function (req, res) {
    return res.render('request', {
      sysSub: sysSub,
      roles: req.session.roles,
    });
  });

  // get the requests owned by the current user
  // this is different from the request with status parameter
  // need more work when sharing is enabled
  app.get('/requests', auth.ensureAuthenticated, function (req, res) {
    Request.find({
      createdBy: req.session.userid,
    }).lean().exec(function (err, requests) {
      if (err) {
        return res.json(500, {
          error: err.message,
        });
      }
      return res.json(requests);
    });
  });

  app.get('/requests/json', auth.ensureAuthenticated, function (req, res) {
    Request.find({
      createdBy: req.session.userid,
    }).lean().exec(function (err, requests) {
      if (err) {
        return res.json(500, {
          error: err.message,
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
    let request: any = {};
    const requests = [];
    let i;
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
            res.send(500, err.message);
          } else {
            res.send(201, req.body.quantity + ' requests created');
          }
        });
      } else if (req.body.quantity && req.body.quantity >= 21) {
        res.send(400, 'the quantity needs to be less than 21.');
      } else {
        (new Request(request)).save(function (err, cableRequest) {
          if (err) {
            console.error(err);
            return res.send(500, err.message);
          }
          const url = req.protocol + '://' + req.get('host') + '/requests/' + cableRequest.id;
          res.set('Location', url);
          res.json(201, {
            location: '/requests/' + cableRequest.id,
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
      roles: req.session.roles,
    });
  });

  app.delete('/requests/:id/', auth.ensureAuthenticated, function (req, res) {
    Request.findById(req.params.id).exec(function (err, request: any) {
      if (err) {
        console.error(err);
        return res.send(500, err.message);
      }
      if (request) {
        if (req.session.userid !== request.createdBy) {
          return res.send(403, 'current user is not allowed to delete this resource');
        }
        if (request.status === 1 || request.status === 2) {
          return res.send(400, 'this resource is not allowed to be deleted');
        }
        request.remove(function (e) {
          if (e) {
            console.error(e);
            return res.send(500, e.message);
          }
          console.log('request ' + req.params.id + ' was deleted');
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
        console.error(err);
        return res.json(500, {
          error: err.message
        });
      }
      res.json(cableRequest);
    });
  });

  app.get('/requests/:id/details', auth.ensureAuthenticated, function (req, res) {
    Request.findById(req.params.id).lean().exec(function (err, cableRequest) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: err.message
        });
      }
      if (cableRequest) {
        res.render('requestdetails', {
          request: cableRequest,
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
        console.error(err);
        return res.json(500, {
          error: err.message,
        });
      }
      return res.json(docs);
    });
  }

  app.get('/requests/statuses/:s/json', auth.ensureAuthenticated, auth.verifyRoles(['manager', 'admin']), function (req, res) {
    const status = parseInt(req.params.s, 10);
    if (status < 0 || status > 4) {
      return res.send(400, 'the status ' + status + ' is invalid.');
    }
    let query;
    // admin see all
    if (req.session.roles.indexOf('admin') !== -1) {
      query = {
        status: status,
      };
      findRequest(query, res);
    } else {
      // manager see his own wbs
      User.findOne({
        adid: req.session.userid,
      }).lean().exec(function (err, user) {
        if (err) {
          console.error(err);
          return res.send(500, err.message);
        }
        if (!user) {
          return res.send(404, 'cannot identify you.');
        }
        if (user.wbs === undefined || user.wbs.length === 0) {
          return res.json([]);
        }
        query = {
          'basic.wbs': {
            $in: user.wbs,
          },
          status: status,
        };
        findRequest(query, res);
      });
    }
  });

  function authorize(req, res, next) {
    const roles = req.session.roles;
    const action = req.body.action;
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
    const request = req.body.request || {};
    request.updatedBy = req.session.userid;
    request.updatedOn = Date.now();

    if (req.body.action === 'save') {
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 0,
      }, request, {
        new: true,
      }, function (err, cableRequest) {
        if (err) {
          console.error(err);
          return res.json(500, {
            error: err.message,
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' gone');
        return res.json(410, {
          error: req.params.id + ' gone',
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
        status: 0,
      }, request, {
        new: true,
      }, function (err, cableRequest) {
        if (err) {
          console.error(err);
          return res.json(500, {
            error: err.message,
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' cannot be submitted');
        return res.json(410, {
          error: req.params.id + ' cannot be submitted',
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
        status: 1,
      }, request, {
        new: true,
      }, function (err, cableRequest) {
        if (err) {
          console.error(err);
          return res.json(500, {
            error: err.message,
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' cannot be reverted');
        return res.json(400, {
          error: req.params.id + ' cannot be reverted',
        });
      });
    }

    if (req.body.action === 'adjust') {
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1,
      }, request, {
        new: true,
      }, function (err, cableRequest) {
        if (err) {
          console.error(err);
          return res.json(500, {
            error: err.message,
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' gone');
        return res.json(410, {
          error: req.params.id + ' gone',
        });
      });
    }

    if (req.body.action === 'reject') {
      request.rejectedBy = req.session.userid;
      request.rejectedOn = Date.now();
      request.status = 3;
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1,
      }, request, {
        new: true,
      }, function (err, cableRequest) {
        if (err) {
          console.error(err);
          return res.json(500, {
            error: err.message,
          });
        }
        if (cableRequest) {
          return res.json(200, cableRequest.toJSON());
        }
        console.error(req.params.id + ' gone');
        return res.json(410, {
          error: req.params.id + ' gone',
        });
      });
    }

    if (req.body.action === 'approve') {
      request.approvedBy = req.session.userid;
      request.approvedOn = Date.now();
      request.status = 2;
      Request.findOneAndUpdate({
        _id: req.params.id,
        status: 1,
      }, request, {
        new: true,
      }).exec(
        function (err, cableRequest: any) {
          if (err) {
            console.error(err);
            return res.json(500, {
              error: err.message,
            });
          }
          if (cableRequest) {
            createCable(cableRequest.toJSON(), req, res, cableRequest.basic.quantity, []);
          } else {
            console.error(req.params.id + ' gone');
            return res.json(410, {
              error: req.params.id + ' gone',
            });
          }
        }
      );
    }

  });


  // not used
  /*  app.get('/cables', auth.ensureAuthenticated, function (req, res) {
      Cable.find({
        submittedBy: req.session.userid
      }).lean().exec(function (err, cables) {
        if (err) {
          return res.json(500, {
            error: err.message
          });
        }
        return res.json(cables);
      });
    });*/


  // get the user's cables
  app.get('/cables/json', auth.ensureAuthenticated, function (req, res) {
    Cable.find({
      submittedBy: req.session.userid,
    }).lean().exec(function (err, cables) {
      if (err) {
        return res.json(500, {
          error: err.message,
        });
      }
      return res.json(cables);
    });
  });

  app.get('/allcables', auth.ensureAuthenticated, function (req, res) {
    res.render('all-cables');
  });


  // get all the cables
  app.get('/allcables/json', auth.ensureAuthWithToken, function (req, res) {
    const low = 100;
    const up = 499;
    Cable.where('status').gte(low).lte(up).lean().exec(function (err, docs) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: err.message,
        });
      }
      return res.json(docs);
    });
  });

  app.get('/workingsheets', auth.ensureAuthenticated, function (req, res) {
    res.render('workingsheets');
  });

  app.get('/activecables/json', auth.ensureAuthenticated, auth.verifyRoles(['manager', 'admin']), function (req, res) {
    // if (req.session.roles === undefined || (req.session.roles.indexOf('manager') === -1 && req.session.roles.indexOf('admin') === -1)) {
    //   return res.send(403, 'You are not authorized to access this resource. ');
    // }
    const low = 100;
    const up = 499;
    if (req.session.roles.indexOf('admin') !== -1) {
      Cable.where('status').gte(low).lte(up).lean().exec(function (err, docs) {
        if (err) {
          console.error(err);
          return res.json(500, {
            error: err.message,
          });
        }
        return res.json(docs);
      });
    } else {
      // manager see his own wbs
      User.findOne({
        adid: req.session.userid,
      }).lean().exec(function (err, user) {
        if (err) {
          console.error(err);
          return res.send(500, err.message);
        }
        if (!user) {
          return res.send(404, 'cannot identify you.');
        }
        if (user.wbs === undefined || user.wbs.length === 0) {
          return res.json([]);
        }

        Cable.where('status').gte(low).lte(up).where('basic.wbs').in(user.wbs).lean().exec(function (e, docs) {
          if (e) {
            console.error(e);
            return res.json(500, {
              error: e.message,
            });
          }
          return res.json(docs);
        });
      });
    }
  });


  // status: 1 for procuring, 2 for installing, 3 for installed

  app.get('/cables/statuses/:s/json', auth.ensureAuthenticated, auth.verifyRoles(['manager', 'admin']), function (req, res) {
    const status = parseInt(req.params.s, 10);
    if (status < 0 || status > 5) {
      return res.json(400, {
        error: 'wrong status',
      });
    }

    if (status === 0) {
      if (req.session.roles.indexOf('admin') !== -1) {
        // get all the cables
        Cable.find({}).lean().exec(function (err, docs) {
          if (err) {
            console.error(err);
            return res.json(500, {
              error: err.message,
            });
          }
          return res.json(docs);
        });
      } else {
        return res.send(403, 'Only admin can access this resource. ');
      }
    } else {
      const low = status * 100;
      const up = status * 100 + 99;
      if (req.session.roles.indexOf('admin') !== -1) {
        Cable.where('status').gte(low).lte(up).lean().exec(function (err, docs) {
          if (err) {
            console.error(err);
            return res.json(500, {
              error: err.message,
            });
          }
          return res.json(docs);
        });
      } else {
        // manager see his own wbs
        User.findOne({
          adid: req.session.userid,
        }).lean().exec(function (err, user) {
          if (err) {
            console.error(err);
            return res.send(500, err.message);
          }
          if (!user) {
            return res.send(404, 'cannot identify you.');
          }
          if (user.wbs === undefined || user.wbs.length === 0) {
            return res.json([]);
          }

          Cable.where('status').gte(low).lte(up).where('basic.wbs').in(user.wbs).lean().exec(function (e, docs) {
            if (e) {
              console.error(e);
              return res.json(500, {
                error: e.message,
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
      number: req.params.id,
    }).lean().exec(function (err, cable) {
      if (err) {
        console.error(err);
        return res.send(500, err.message);
      }
      if (cable) {
        return res.render('cable', {
          sysSub: sysSub,
          number: req.params.id,
        });
      }
      return res.send(403, 'cannot find cable ' + req.params.id);
    });

  });

  app.get('/cables/:id/json', auth.ensureAuthWithToken, function (req, res) {
    Cable.findOne({
      number: req.params.id,
    }).exec(function (err, cable) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: err.message,
        });
      }
      res.json(cable);
    });
  });

  app.get('/cables/:id/changes/', auth.ensureAuthenticated, function (req, res) {
    res.send('not implemented');
  });

  app.get('/cables/:id/changes/json', auth.ensureAuthenticated, function (req, res) {
    Cable.findOne({
      number: req.params.id,
    }, 'changeHistory').lean().exec(function (err, cable) {
      if (err) {
        console.error(err);
        return res.send(500, err.message);
      }
      // console.log(cable);
      if (!cable.hasOwnProperty('changeHistory')) {
        return res.json([]);
      }
      if (cable.changeHistory.length === 0) {
        return res.json([]);
      }
      Change.find({
        _id: {
          $in: cable.changeHistory,
        }
      }).lean().exec(function changeCB(err1, changes) {
        if (err1) {
          console.error(err1);
          return res.send(500, err1.message);
        }
        MultiChange.find({
          _id: {
            $in: cable.changeHistory,
          }
        }).lean().exec(function multiChangesCB(err2, multiChanges) {
          if (err2) {
            console.error(err2);
            return res.send(500, err1.message);
          }
          res.json(changes.concat(multiChanges));
        });
      });
    });
  });

  app.put('/cables/:id/', auth.ensureAuthenticated, auth.verifyRoles(['manager']), function updateCB(req, res) {
    const conditions: any = {
      number: req.params.id,
    };
    const update: any = {};
    const changes = [];
    let inValidAction = false;

    const required = req.body.required;

    switch (req.body.action) {
    case 'update':
      if (req.body.oldValue === null) {
        // for string, treat null and '' as the same
        conditions[req.body.property] = {
          $in: [null, ''],
        };
      } else if (req.body.oldValue === false) {
        // for boolean, treat false and '' as the same
        conditions[req.body.property] = {
          $in: [null, false],
        };
      } else {
        conditions[req.body.property] = req.body.oldValue;
      }
      update[req.body.property] = req.body.newValue;
      update.$inc = {
        __v: 1,
      };
      break;
    case 'to-terminated':
      conditions['to.readyForTerm'] = true;
      changes.push({
        property: 'to.terminatedBy',
        newValue: (!req.body.name || req.body.name === '') ? req.session.username : req.body.name,
        oldValue: null,
      });
      changes.push({
        property: 'to.terminatedOn',
        newValue: (!req.body.date || req.body.date === '') ? new Date() : new Date(req.body.date),
        oldValue: null,
      });
      update.updatedOn = Date.now();
      update.updatedBy = req.session.userid;
      updateCableWithChanges(conditions, update, changes, req, res);
      return;
    case 'from-terminated':
      conditions['from.readyForTerm'] = true;
      changes.push({
        property: 'from.terminatedBy',
        newValue: (!req.body.name || req.body.name === '') ? req.session.username : req.body.name,
        oldValue: null,
      });
      changes.push({
        property: 'from.terminatedOn',
        newValue: (!req.body.date || req.body.date === '') ? new Date() : new Date(req.body.date),
        oldValue: null,
      });
      update.updatedOn = Date.now();
      update.updatedBy = req.session.userid;
      updateCableWithChanges(conditions, update, changes, req, res);
      return;
    case 'installed':
      conditions['to.readyForTerm'] = true;
      conditions['to.terminatedBy'] = { $nin: [null, '']};
      conditions['to.terminatedOn'] = { $ne: null};
      conditions['from.readyForTerm'] = true;
      conditions['from.terminatedBy'] = { $nin: [null, '']};
      conditions['from.terminatedOn'] = { $ne: null};
      changes.push({
        property: 'installedBy',
        newValue: (!req.body.name || req.body.name === '') ? req.session.username : req.body.name,
        oldValue: null,
      });
      changes.push({
        property: 'installedOn',
        newValue: (!req.body.date || req.body.date === '') ? new Date() : new Date(req.body.date),
        oldValue: null,
      });
      changes.push({
        property: 'status',
        newValue: 300,
        oldValue: 250,
      });
      update.updatedOn = Date.now();
      update.updatedBy = req.session.userid;
      updateCableWithChanges(conditions, update, changes, req, res);
      return;
    case 'obsolete':
      conditions.status = {
        $lte: 500,
      };
      update.status = 501;
      update.obsoletedBy = req.session.userid;
      update.obsoletedOn = Date.now();
      break;
    case 'order':
      update.status = 101;
      update.orderedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.orderedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'receive':
      update.status = 102;
      update.receivedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.receivedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'accept':
      update.status = 103;
      update.orderedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.orderedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'install':
      update.status = 200;
      break;
    case 'label':
      conditions.status = {
        $gte: 200,
      };
      update.status = 201;
      update.labeledBy = req.body.name === '' ? req.session.username : req.body.name;
      update.labeledOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'benchTerm':
      conditions.status = {
        $gte: 200,
      };
      update.status = 202;
      update.benchTerminatedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.benchTerminatedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'benchTest':
      conditions.status = {
        $gte: 200,
      };
      update.status = 203;
      update.benchTestedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.benchTestedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'pull':
      // check required steps
      conditions.status = {
        $gte: 200
      };
      if (required && required.label) {
        conditions.labeledBy = {
          $exists: true,
        };
      }
      if (required && required.benchTerm) {
        conditions.benchTerminatedBy = {
          $exists: true,
        };
      }
      if (required && required.benchTest) {
        conditions.benchTestedBy = {
          $exists: true,
        };
      }
      update.status = 249;
      break;
    case 'pulled':
      conditions.status = 249;
      update.status = 250;
      update.pulledBy = req.body.name === '' ? req.session.username : req.body.name;
      update.pulledOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'fieldTerm':
      conditions.status = {
        $gte: 250,
      };
      update.status = 251;
      update.fieldTerminatedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.fieldTerminatedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'fieldTest':
      conditions.status = {
        $gte: 250,
      };
      if (required && required.fieldTerm) {
        conditions.fieldTerminatedBy = {
          $exists: true,
        };
      }
      update.status = 252;
      update.fieldTestedBy = req.body.name === '' ? req.session.username : req.body.name;
      update.fieldTestedOn = req.body.date === '' ? Date.now() : (Date as any)(req.body.date);
      break;
    case 'use':
      // check required steps
      conditions.status = 252;
      if (required && required.fieldTerm) {
        conditions.fieldTerminatedBy = {
          $exists: true,
        };
      }
      conditions.fieldTestedBy = {
        $exists: true,
      };
      update.status = 300;
      break;
    default:
      inValidAction = true;
    }
    if (inValidAction) {
      return res.send(400, 'invalid action');
    }
    update.updatedOn = Date.now();
    update.updatedBy = req.session.userid;
    if (req.body.action !== 'update') {
      updateCable(conditions, update, req, res);
    } else {
      const change = new Change({
        cableName: req.params.id,
        property: req.body.property,
        oldValue: req.body.oldValue,
        newValue: req.body.newValue,
        updatedBy: req.session.userid,
        updatedOn: Date.now()
      });
      change.save(function (err, doc) {
        if (err) {
          console.error(err);
          return res.send(500, 'cannot save the change');
        }
        update.$push = {
          changeHistory: doc._id,
        };
        updateCable(conditions, update, req, res);
      });
    }
  });
}
