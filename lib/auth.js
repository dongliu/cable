// authentication and authorization functions
var Client = require('cas.js');
var url = require('url');
var ad = require('../config/ad.json');
var authConfig = require('../config/auth.json');
// var pause = require('pause');

var ldapClient = require('../lib/ldap-client');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var cas = new Client({
  base_url: authConfig.cas,
  service: authConfig.service,
  version: 1.0
});

// Authorize request using API token otherwise use standard method.
function ensureAuthWithToken(req, res, next) {
  var len, idx, tok = req.query.token;
  if (tok && Array.isArray(authConfig.tokens)) {
    len = authConfig.tokens.length;
    for(idx=0; idx<len; idx+=1) {
      if(tok === authConfig.tokens[idx]) {
        next();
        return;
      }
    }
  }
  ensureAuthenticated(req, res, next);
}

function ensureAuthenticated(req, res, next) {
  var ticketUrl = url.parse(req.url, true);
  if (req.session.userid) {
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
    // redirected by CAS
    // var halt = pause(req);
    cas.validate(req.query.ticket, function (err, casresponse, result) {
      if (err) {
        console.error(err.message);
        return res.send(401, err.message);
      }
      if (result.validated) {
        var userid = result.username.toLowerCase();
        req.session.userid = userid;
        User.findOne({
          adid: userid
        }).exec(function (err0, user) {
          if (err0) {
            console.error(err0);
            return res.send(500, 'internal error with db');
          }
          if (user) {
            req.session.roles = user.roles;
            req.session.username = user.name;
            user.lastVisitedOn = Date.now();
            user.save(function (err1) {
              if (err1) {
                console.error(err1.message);
              }
            });
            if (req.session.landing && req.session.landing !== '/login') {
              return res.redirect(req.session.landing);
            }
            // has a ticket but not landed before, must copy the ticket from somewhere ...
            return res.redirect('/');
            // halt.resume();
          }
          // create a new user
          var searchFilter = ad.searchFilter.replace('_id', userid);
          var opts = {
            filter: searchFilter,
            attributes: ad.objAttributes,
            scope: 'sub'
          };
          ldapClient.search(ad.searchBase, opts, false, function (err2, ldapResult) {
            if (err2) {
              console.error(err2.name + ' : ' + err2.message);
              return res.send(500, 'something wrong with ad');
            }
            if (ldapResult.length === 0) {
              console.warn('cannot find ' + userid);
              return res.send(500, userid + ' is not found!');
            }
            if (ldapResult.length > 1) {
              return res.send(500, userid + ' is not unique!');
            }

            var first = new User({
              adid: userid,
              name: ldapResult[0].displayName,
              email: ldapResult[0].mail,
              office: ldapResult[0].physicalDeliveryOfficeName,
              phone: ldapResult[0].telephoneNumber,
              mobile: ldapResult[0].mobile,
              roles: [],
              lastVisitedOn: Date.now()
            });

            first.save(function (err3, newUser) {
              if (err3) {
                // cannot save this user
                console.error(err3);
                console.error(first.toJSON());
                return res.send(500, 'Cannot log in. Please contact the admin. Thanks.');
              }
              console.info('A new user logs in: ' + newUser);
              // halt.resume();
              req.session.roles = [];
              req.session.username = first.name;

              if (req.session.landing && req.session.landing !== '/login') {
                return res.redirect(req.session.landing);
              }
              // has a ticket but not landed before, must copy the ticket from somewhere ...
              return res.redirect('/');
            });
          });
        });
      } else {
        console.error('CAS reject this ticket: ' + req.query.ticket);
        return res.send(401, 'CAS reject this ticket.');
      }
    });
  } else if (req.xhr) {
    // if this is ajax call, then tell the browser about this without redirect
    res.set('WWW-Authenticate', 'CAS realm="' + url.format({
      protocol: 'http',
      hostname: ticketUrl.hostname
    }) + '"');
    res.send(401, 'xhr cannot be authenticated');
  } else {
    req.session.landing = req.url;
    res.redirect(authConfig.cas + '/login?service=' + encodeURIComponent(authConfig.service));
  }

}

function verifyRoles(roles) {
  return function (req, res, next) {
    if (roles.length === 0) {
      return next();
    }
    var i;
    if (req.session.roles) {
      for (i = 0; i < roles.length; i += 1) {
        if (req.session.roles.indexOf(roles[i]) > -1) {
          return next();
        }
      }
      res.send(403, 'You are not authorized to access this resource. ');
    } else {
      console.log('Cannot identify your roles.');
      res.send(500, 'something wrong with your session');
    }
  };
}


module.exports = {
  ensureAuthWithToken: ensureAuthWithToken,
  ensureAuthenticated: ensureAuthenticated,
  verifyRoles: verifyRoles
};
