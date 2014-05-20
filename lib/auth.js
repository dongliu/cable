// authentication and authorization functions
var url = require('url');

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  verifyRole: verifyRole
};

function ensureAuthenticated(req, res, next) {
  if (req.session.userid) {
    return next();
  } else {
    // if this is ajax call, then force the browser to refresh to the current page
    if (req.xhr) {
      return res.send(401);
    } else {
      req.session.userid = 'demo';
      User.findOne({
        id: 'demo'
      }).lean().exec(function (err, user) {
        if (err) {
          console.error(err.msg);
          // still let it go without create the user?
          req.session.roles = [];
          req.session.username = 'unknown';
          return next();
        } else {
          if (user) {
            req.session.roles = user.roles;
            req.session.username = user.name;
            User.findByIdAndUpdate(user._id, {
              lastVisitedOn: Date.now()
            }).lean().exec(function (err, update) {
              if (err) {
                console.error(err.message);
              }
            });
            return next();
          } else {
            // create a new user
            var first = new User({
              id: 'demo',
              name: 'demo user',
              email: 'demo@demo.com',
              office: 'everywhere',
              phone: '(123) 456-7890',
              mobile: '(123) 456-7890',
              roles: ['manage', 'admin'],
              lastVisitedOn: Date.now()
            });

            first.save(function (err, newUser) {
              if (err) {
                console.error(err.msg);
              }
              req.session.roles = ['manage', 'admin'];
              console.info('A new user logs in: ' + newUser.name);
              req.session.username = newUser.name;
              return next();
            });
          }
        }
      });

    }
  }
}

function verifyRole(role) {
  return function (req, res, next) {
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
