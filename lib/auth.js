/*eslint max-nested-callbacks: [2, 4], complexity: [2, 20]*/

// authentication and authorization functions
var url = require('url');
var mongoose = require('mongoose');
var ldapClient = require('../lib/ldap-client');

var ad = require('../config/ad.json');
var auth = require('../config/auth.json');

// Create CAS client
var Client;
var cas;
var ldapLoginService;
if (auth.type === 'cas') {
  Client = require('cas.js');
  // validation of ticket is with the lan, and therefore url does not need to be proxied.
  cas = new Client({
    base_url: auth.cas,
    service: auth.login_service,
    version: 1.0
  });
} else if (auth.type === 'ldap') {
  ldapLoginService = '/ldaplogin/';
}

var User = mongoose.model('User');

function redirectService(res, req, destination) {
  req.session.landing = undefined;
  return res.redirect(auth.service + destination);
}

function redirectToLoginService(req, res) {
  if (auth.type === 'cas') {
    // if this is ajax call, then send 401 without redirect
    if (req.xhr) {
      // TODO: might need to properly set the WWW-Authenticate header
      res.set('WWW-Authenticate', 'CAS realm="' + auth.service + '"');
      res.status(401);
      return res.send('xhr cannot be authenticated');
    } else {
      // set the landing, the first unauthenticated url
      req.session.landing = req.url;

      return res.redirect(auth.cas + '/login?service=' + encodeURIComponent(auth.login_service));
    }
  }

  if (auth.type === 'ldap') {
    //ldap
    if (req.xhr) {
      res.status(401);
      return res.send('xhr cannot be authenticated');
    } else {
      req.session.landing = req.originalUrl;
      return redirectService(res, req, ldapLoginService);
    }
  }

  res.status(500);
  return res.send('unknown authentication');

}

function getCurrentUser(opts, searchBase, req, res, userid, cb) {
  // query ad about other attribute
  ldapClient.search(searchBase, opts, false, function (err, result) {
    if (err) {
      console.error('cannot search due to ' + err.name + ' : ' + err.message);
      res.status(500);
      return res.send('something wrong with ad');
    }
    if (result.length === 0) {
      console.warn('cannot find ' + userid);
      res.status(500);
      return res.send(userid + ' is not found!');
    }
    if (result.length > 1) {
      res.status(500);
      return res.send(userid + ' is not unique!');
    }

    // set username in session
    req.session.username = result[0].displayName;

    // load others from db
    User.findOne({
      adid: userid
    }).exec(function (findErr, user) {
      if (findErr) {
        console.error(findErr.message);
      }
      if (user) {
        req.session.roles = user.roles;
        // update user last visited on
        User.findByIdAndUpdate(user._id, {
          lastVisitedOn: Date.now()
        }, function (updatErr) {
          if (updatErr) {
            console.error(updatErr.message);
          }
        });
      } else {
        // create a new user
        // TODO: need to load the user properties using ad.objAttributes
        var default_roles = [];
        if (auth.default_roles !== undefined) {
          default_roles = auth.default_roles;
        }
        req.session.roles = default_roles;

        var first = new User({
          adid: userid,
          name: result[0].displayName,
          email: result[0].mail,
          office: result[0].physicalDeliveryOfficeName,
          phone: result[0].telephoneNumber,
          mobile: result[0].mobile,
          roles: default_roles,
          lastVisitedOn: Date.now()
        });

        first.save(function (saveErr, newUser) {
          if (saveErr) {
            console.error(saveErr);
            console.error(newUser.toJSON());
            return res.send(500, 'Cannot log in. Please contact the admin. Thanks.');
          }
          return console.info('A new user created : ' + newUser.name);
        });
      }
      return cb();
    });
  });
}

function authenticationSucceeded(username, baseDN, req, res) {
  var searchFilter = ad.searchFilter.replace('_id', username);

  var opts = {
    filter: searchFilter,
    attributes: ad.objAttributes,
    scope: 'sub'
  };

  getCurrentUser(opts, baseDN, req, res, username, function () {
    req.session.userid = username;
    if (req.session.landing === undefined) {
      return redirectService(res, req, '/');
    } else {
      return redirectService(res, req, req.session.landing);
    }
  });
}

function ldapEnsureAuthenticated(req, res, next) {
  if (req.session.userid) {
    //logged in already
    return next();
  } else if (req.originalUrl !== ldapLoginService) {
    //Not on the login page currently so redirect user to login page
    return redirectToLoginService(req, res);
  } else {
    //POST method once the user submits the login form.
    //Perform authentication
    var username = req.body.username;
    var password = req.body.password;

    var baseDN = ad.searchBase;

    var bindDN = 'uid=' + username + ',' + baseDN;
    if (ad.usernameSuffix !== undefined) {
      bindDN = username + ad.usernameSuffix;
    }

    ldapClient.bind(bindDN, password, function (err) {
      password = undefined;
      if (err === null) {
        return authenticationSucceeded(username, baseDN, req, res, next);
      } else {
        var error = '';
        //Do not notify the user if the username is valid
        if (err.name === 'NoSuchObjectError' || err.name === 'InvalidCredentialsError') {
          error = 'Invalid username or password was provided.';
        } else {
          error = err.name;
        }
        res.locals.error = error;
        return next();
      }
    });
  }
}

function casEnsureAuthenticated(req, res, next) {
  // console.log(req.session);
  var ticketUrl = url.parse(req.url, true);
  if (req.session.userid) {
    // logged in already
    if (req.query.ticket) {
      // remove the ticket query param
      delete ticketUrl.query.ticket;
      return res.redirect(301, url.format({
        pathname: ticketUrl.pathname,
        query: ticketUrl.query
      }));
    }
    next();
  } else if (req.query.ticket) {
    // just kicked back by CAS
    // var halt = pause(req);

    cas.service = auth.login_service;

    var cas_hostname = cas.hostname.split(':');
    if (cas_hostname.length === 2) {
      cas.hostname = cas_hostname[0];
      cas.port = cas_hostname[1];
    }

    // validate the ticket
    cas.validate(req.query.ticket, function (err, casresponse, result) {
      if (err) {
        console.error(err.message);
        return res.send(401, err.message);
      }
      if (result.validated) {
        var userid = result.username;
        // set userid in session
        req.session.userid = userid;
        var searchFilter = ad.searchFilter.replace('_id', userid);
        var opts = {
          filter: searchFilter,
          attributes: ad.objAttributes,
          scope: 'sub'
        };

        getCurrentUser(opts, ad.searchBase, req, res, userid, function () {
          if (req.session.landing && req.session.landing !== '/login') {
            return res.redirect(req.session.landing);
          }
            // has a ticket but not landed before, must copy the ticket from somewhere ...
            return res.redirect('/');
        });
      } else {
        console.error('CAS reject this ticket');
        return res.redirect(auth.login_service);
      }
    });
  } else {
    return redirectToLoginService(req, res);
  }
}

function ensureAuthenticated(req, res, next) {
  if (auth.type === 'cas') {
    return casEnsureAuthenticated(req, res, next);
  } else if (auth.type === 'ldap') {
    return ldapEnsureAuthenticated(req, res, next);
  }

  res.status(500);
  return res.send('unknown authentication');
}

// Authorize request using API token otherwise use standard method.
function ensureAuthWithToken(req, res, next) {
  var len;
  var idx;
  var tok = req.query.token;
  if (tok && Array.isArray(auth.tokens)) {
    len = auth.tokens.length;
    for (idx = 0; idx < len; idx += 1) {
      if (tok === auth.tokens[idx]) {
        next();
        return;
      }
    }
  }
  ensureAuthenticated(req, res, next);
}

function verifyRoles(role) {
  return function (req, res, next) {
    // console.log(req.session);
    if (req.session.roles) {
      if (req.session.roles.indexOf(role) > -1) {
        next();
      } else {
        res.send(403, 'You are not authorized to access this resource. ');
      }
    } else {
      console.log("Cannot find the user's role.");
      res.send(500, "something wrong for the user's session");
    }
  };
}

module.exports = {
  ensureAuthWithToken: ensureAuthWithToken,
  ensureAuthenticated: ensureAuthenticated,
  verifyRoles: verifyRoles
};
