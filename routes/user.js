var ldap = require('ldapjs');

var ad = require('../config/ad.json');

var client = ldap.createClient({
  url: ad.url,
  maxConnections: 2,
  timeout: 3000
});

var mongoose = require('mongoose');
var User = mongoose.model('User');

var auth = require('../lib/auth');

var Roles = ["adjust", "approve", "install", "qa", "admin"];

module.exports = function(app) {
  // app.get('/users/new', function(req, res) {
  //   res.render('newuser');
  // });

  app.get('/users', function(req, res) {
    res.render('user');
  });

  app.get('/user/:id', function(req, res) {

    var searchFilter = ad.searchFilter.replace('_id', req.params.id);
    var opts = {
      filter: searchFilter,
      attributes: ad.objAttributes,
      scope: 'sub'
    };
    search(ad.searchBase, opts, false, function(err, result) {
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

  app.get('/user/:id/photo', function(req, res) {

    var searchFilter = ad.searchFilter.replace('_id', req.params.id);
    var opts = {
      filter: searchFilter,
      attributes: ad.rawAttributes,
      scope: 'sub'
    };
    search(ad.searchBase, opts, true, function(err, result) {
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

  app.get('/username', function(req, res) {
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
      search(ad.searchBase, opts, false, function(err, result) {
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

function bind(cb) {
  if (ad.bind) {
    return cb();
  }
  client.bind(ad.adminDn, ad.adminPassword, function(err) {
    if (err) {
      console.log(err);
      return cb(err);
    }
    return cb();
  });
}

function search(base, opts, raw, cb) {
  bind(function(err) {
    if (err) {
      return cb(err);
    }
    client.search(base, opts, function(err, result) {
      if (err) {
        console.log(JSON.stringify(err));
        return cb(err);
      }
      var items = [];
      result.on('searchEntry', function(entry) {
        if (raw) {
          items.push(entry.raw);
        } else {
          items.push(entry.object);
        }
      });
      result.on('error', function(err) {
        console.log(JSON.stringify(err));
        return cb(err);
      });
      result.on('end', function(result) {
        if (result.status !== 0) {
          var err = 'non-zero status from LDAP search: ' + result.status;
          console.log(JSON.stringify(err));
          return cb(err);
        }
        switch (items.length) {
          case 0:
            return cb(null, []);
          default:
            return cb(null, items);
        }
      });
    });
  });
}