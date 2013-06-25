// authentication and authorization functions
var Client = require('cas.js');
var url = require('url');
// var role = require('../config/role.json');

var mongoose = require('mongoose');
var User = mongoose.model('User');

var cas = new Client({
  base_url: 'https://liud-dev.nscl.msu.edu/cas',
  service: 'http://localhost:3000',
  version: 1.0
});

module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  verifyRole: verifyRole
};

function ensureAuthenticated(req, res, next) {
  var ticketUrl = url.parse(req.url, true);
  if (req.session.userid) {
    // console.log(req.session);
    if (req.query.ticket) {
      // remove the ticket query param
      delete ticketUrl.query.ticket;
      res.redirect(301, url.format({
        pathname: ticketUrl.pathname,
        query: ticketUrl.query
      }));
    } else {
      next();
    }
  } else if (req.query.ticket) {
    cas.validate(req.query.ticket, function(err, status, userid) {
      if (err) {
        console.error(err.message);
        res.send(401, err.message);
      } else {
        req.session.userid = userid;
        User.findOne({id: userid}).lean().exec(function(err, user){
          if (err) {
            console.error(err.msg);
            // still let it go without the role information
            req.session.roles = [];
          } else {
            if (user) {
              req.session.roles = user.roles;
            } else {
              req.session.roles = [];
            }
          }
          next();
        });

      }
    });
  } else {
    res.redirect('https://' + cas.hostname + cas.base_path + '/login?service=' + encodeURIComponent(cas.service));
  }
}

function verifyRole(role) {
  return function(req, res, next) {
    // console.log(req.session);
    if (req.session.roles) {
      if (req.session.roles.indexOf(role) > -1) {
        return next();
      } else {
        return res.send(403, "You are not authorized to access this resource. ");
      }
    } else {
      console.log("Cannot find the user's role.");
      return res.send(500, "something wrong for the user's session");
    }
  };
}
