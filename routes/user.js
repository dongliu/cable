// var ldap = require('ldapjs');

var ad = require('../config/ad.json');

// var client = ldap.createClient({
//   url: ad.url,
//   maxConnections: 2,
//   timeout: 3000
// });

var ldapClient = require('../lib/ldap-client');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var auth = require('../lib/auth');

var Roles = ["adjust", "approve", "install", "qa", "admin"];

module.exports = function(app) {
  app.get('/users', function(req, res) {
    res.render('user');
  });

  app.post('/users', function(req, res) {
    if (!req.is('json')) {
      return res.send(415, 'json request expected.');
    }

    // get user id
    var nameFilter = ad.nameFilter.replace('_id', req.name);
    var opts = {
      filter: nameFilter,
      attributes: ad.objAttributes,
      scope: 'sub'
    };

    ldapClient.search(ad.searchBase, opts, false, function(err, result) {
      if (err) {
        console.err(err.name + ' : ' + err.message);
        return res.send(500, 'cannot perform the search');
      }

      if (result.length === 0) {
        return res.send(500, req.name + ' is not found in AD!');
      }

      if (result.length > 1) {
        return res.send(500, req.name + ' is not unique!');
      }

      var user = new User({
        id: result[0].sAMAccountName,
        name: result[0].displayName,
        email: result[0].mail,
        office: result[0].physicalDeliveryOfficeName,
        phone: result[0].telephoneNumber,
        mobile: result[0].mobile,
        roles: req.roles
      });



    });

  });

  app.get('/users/json', function(req, res) {
    // res.render('user');
  });


  // TODO: first check the db for the id, then retrieve from the ad?
  app.get('/users/:id', function(req, res) {

    var searchFilter = ad.searchFilter.replace('_id', req.params.id);
    var opts = {
      filter: searchFilter,
      attributes: ad.objAttributes,
      scope: 'sub'
    };
    ldapClient.search(ad.searchBase, opts, false, function(err, result) {
      if (err) {
        return res.send(500, JSON.stringify(err));
      }
      if (result.length === 0) {
        return res.send(500, req.params.id + ' is not found!');
      }
      if (result.length > 1) {
        return res.send(500, req.params.id + ' is not unique!');
      }

      // var json = {};

      // for (var i = 0; i < ad.objAttributes.length; i += 1) {
      //   json[ad.objAttributes[i]] = (new Buffer(result[0][ad.objAttributes[i]])).toString();
      // }

      // for (i = 0; i < ad.rawAttributes.length; i += 1) {
      //   json[ad.rawAttributes[i]] = (new Buffer(result[0][ad.rawAttributes[i]])).toString('base64');
      // }

      return res.json(result[0]);
    });

  });



// resource /adusers

  app.get('/adusers/:id', function(req, res) {

    var searchFilter = ad.searchFilter.replace('_id', req.params.id);
    var opts = {
      filter: searchFilter,
      attributes: ad.objAttributes,
      scope: 'sub'
    };
    ldapClient.search(ad.searchBase, opts, false, function(err, result) {
      if (err) {
        return res.send(500, JSON.stringify(err));
      }
      if (result.length === 0) {
        return res.send(500, req.params.id + ' is not found!');
      }
      if (result.length > 1) {
        return res.send(500, req.params.id + ' is not unique!');
      }

      return res.json(result[0]);
    });

  });


  app.get('/adusers/:id/photo', function(req, res) {

    var searchFilter = ad.searchFilter.replace('_id', req.params.id);
    var opts = {
      filter: searchFilter,
      attributes: ad.rawAttributes,
      scope: 'sub'
    };
    ldapClient.search(ad.searchBase, opts, true, function(err, result) {
      if (err) {
        return res.send(500, JSON.stringify(err));
      }
      if (result.length === 0) {
        return res.send(500, req.params.id + ' is not found!');
      }
      if (result.length > 1) {
        return res.send(500, req.params.id + ' is not unique!');
      }
      res.set('Content-Type', 'image/jpeg');
      return res.send(result[0].thumbnailPhoto);
    });

  });

  app.get('/adusers/names', function(req, res) {
    // var query = req.param('term');
    var query = req.query.term;
    var nameFilter, opts;
    if (query && query.length > 0) {
      nameFilter = ad.nameFilter.replace('_name', query + '*');
      opts = {
        filter: nameFilter,
        attributes: ['displayName'],
        scope: 'sub'
      };
      ldapClient.search(ad.searchBase, opts, false, function(err, result) {
        if (err) {
          return res.send(500, JSON.stringify(err));
        }
        if (result.length === 0) {
          return res.send(500, 'Names starting with ' + query + ' are not found!');
        }
        return res.json(result);
      });
    } else {
      return res.send(500, 'query term is required.');
    }
  });
};

// function bind(cb) {
//   if (ad.bind) {
//     return cb();
//   }
//   client.bind(ad.adminDn, ad.adminPassword, function(err) {
//     if (err) {
//       console.log(err);
//       return cb(err);
//     }
//     // TODO: change bind state?
//     return cb();
//   });
// }

// function search(base, opts, raw, cb) {
//   bind(function(err) {
//     if (err) {
//       return cb(err);
//     }
//     client.search(base, opts, function(err, result) {
//       if (err) {
//         console.log(JSON.stringify(err));
//         return cb(err);
//       }
//       var items = [];
//       result.on('searchEntry', function(entry) {
//         if (raw) {
//           items.push(entry.raw);
//         } else {
//           items.push(entry.object);
//         }
//       });
//       result.on('error', function(err) {
//         console.log(JSON.stringify(err));
//         return cb(err);
//       });
//       result.on('end', function(result) {
//         if (result.status !== 0) {
//           var err = 'non-zero status from LDAP search: ' + result.status;
//           console.log(JSON.stringify(err));
//           return cb(err);
//         }
//         switch (items.length) {
//           case 0:
//             return cb(null, []);
//           default:
//             return cb(null, items);
//         }
//       });
//     });
//   });
// }