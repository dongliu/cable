// authentication and authorization functions
var Client = require('cas.js');
var url = require('url');
var ad = require('../config/ad.json');
var authConfig = require('../config/auth.json');
var pause = require('pause');

var ldapClient = require('../lib/ldap-client');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var cas = new Client({
  base_url: authConfig.cas,
  service: authConfig.service,
  version: 1.0
});

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
        var userid = result.username;
        req.session.userid = userid;
        User.findOne({
          adid: userid
        }).exec(function (err, user) {
          if (err) {
            console.error(err.msg);
            return res.send(500, 'internal error with db');
          }
          if (user) {
            req.session.roles = user.roles;
            req.session.username = user.name;
            user.lastVisitedOn = Date.now();
            user.save(function (err) {
              if (err) {
                console.error(err.message);
              }
            });
            if (req.session.landing && req.session.landing !== '/login') {
              return res.redirect(req.session.landing);
            }
            // has a ticket but not landed before, must copy the ticket from somewhere ...
            return res.redirect('/');
            // if (req.session.landing) {
            //   return res.redirect(req.session.landing);
            // }
            // next();
            // halt.resume();
          }
          // create a new user
          var searchFilter = ad.searchFilter.replace('_id', userid);
          var opts = {
            filter: searchFilter,
            attributes: ad.objAttributes,
            scope: 'sub'
          };
          ldapClient.search(ad.searchBase, opts, false, function (err, result) {
            if (err) {
              console.error(err.name + ' : ' + err.message);
              return res.send(500, 'something wrong with ad');
            }
            if (result.length === 0) {
              console.warn('cannot find ' + userid);
              return res.send(500, userid + ' is not found!');
            }
            if (result.length > 1) {
              return res.send(500, userid + ' is not unique!');
            }

            var first = new User({
              adid: userid,
              name: result[0].displayName,
              email: result[0].mail,
              office: result[0].physicalDeliveryOfficeName,
              phone: result[0].telephoneNumber,
              mobile: result[0].mobile,
              roles: [],
              lastVisitedOn: Date.now()
            });

            first.save(function (err, newUser) {
              if (err) {
                console.error(err.msg);
                // return res.send(500, 'internal error with db');
              }
              console.info('A new user logs in: ' + newUser.name);
              // halt.resume();
            });

            req.session.roles = [];
            req.session.username = first.name;

            if (req.session.landing && req.session.landing !== '/login') {
              return res.redirect(req.session.landing);
            }
            // has a ticket but not landed before, must copy the ticket from somewhere ...
            return res.redirect('/');
          });
        });
      } else {
        console.error('CAS reject this ticket: ' + req.query.ticket);
        return res.send(401, 'CAS reject this ticket.');
      }
    });
  } else {
    // if this is ajax call, then tell the browser about this without redirect
    if (req.xhr) {
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
}

function verifyRole(role) {
  return function (req, res, next) {
    if (req.session.roles) {
      if (req.session.roles.indexOf(role) > -1) {
        next();
      } else {
        res.send(403, "You are not authorized to access this resource. ");
      }
    } else {
      console.log("Cannot find the user's role.");
      res.send(500, "something wrong for the user's session");
    }
  };
}


module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  verifyRole: verifyRole
};
