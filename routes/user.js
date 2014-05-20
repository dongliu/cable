var mongoose = require('mongoose');
var User = mongoose.model('User');

var auth = require('../lib/auth');

var Roles = ['manage', 'admin'];

module.exports = function(app) {

  app.get('/users', auth.ensureAuthenticated, function(req, res) {
    if (req.query.name) {
      User.findOne({
        name: req.query.name
      }).lean().exec(function(err, user) {
        if (err) {
          console.error(err.msg);
          return res.send(500, err.msg);
        }
        if (user) {
          return res.render('user', {
            user: user,
            myRoles: req.session.roles
          });
        } else {
          return res.send(404, req.query.name + ' not found');
        }
      });
    } else {
      if (req.session.roles.length !== 0) {
        return res.render('users');
      } else {
        return res.send(403, 'only admin allowed');
      }
    }

  });


  app.post('/users', auth.ensureAuthenticated, function(req, res) {

    if (req.session.roles.indexOf('admin') == -1) {
      return res.send(403, 'only admin allowed');
    }

    if (!req.body.name) {
      return res.send(400, 'need to know name');
    }

    // return res.send(200, req.body.name);

    // check if already in db

    User.findOne({
      name: req.body.name
    }).lean().exec(function(err, user) {
      if (err) {
        return res.send(500, err.msg);
      }
      if (user) {
        var url = req.protocol + '://' + req.get('host') + '/users/' + user.id;
        res.set('Location', url);
        return res.send(303, 'The user is at ' + url);
      } else {
        addUser(req, res);
      }
    });

  });



  app.get('/users/json', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.length === 0) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    User.find().lean().exec(function(err, users) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      res.json(users);
    });
  });


  app.get('/users/:id', auth.ensureAuthenticated, function(req, res) {
    // if (req.session.roles.indexOf('admin') === -1) {
    //   return res.send(403, "You are not authorized to access this resource. ");
    // }
    User.findOne({
      id: req.params.id
    }).lean().exec(function(err, user) {
      if (err) {
        console.error(err.msg);
        return res.send(500, err.msg);
      }
      if (user) {

        return res.render('user', {
          user: user,
          myRoles: req.session.roles
        });
      } else {
        return res.send(404, req.params.id + ' not found');
      }
    });
  });

  app.put('/users/:id', auth.ensureAuthenticated, function(req, res) {
    if (req.session.roles.indexOf('admin') === -1) {
      return res.send(403, "You are not authorized to access this resource. ");
    }
    if (!req.is('json')) {
      return res.json(415, {
        error: 'json request expected.'
      });
    }
    User.findOneAndUpdate({
      id: req.params.id
    }, req.body).lean().exec(function(err, user) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.msg
        });
      }
      res.send(204);
    });
  });

  // get from the db not ad
  app.get('/users/:id/json', auth.ensureAuthenticated, function(req, res) {

    User.findOne({
      id: req.params.id
    }).lean().exec(function(err, user) {
      if (err) {
        console.error(err.msg);
        return res.json(500, {
          error: err.mesage
        });
      }
      return res.json(user);
    });
  });



  // resource /adusers

  app.get('/adusers/:id', auth.ensureAuthenticated, function(req, res) {
    res.send(410, 'cannot find user');
  });


  app.get('/adusers/:id/photo', auth.ensureAuthenticated, function(req, res) {
    res.send(410, 'cannot find user');
  });

  app.get('/adusernames', auth.ensureAuthenticated, function(req, res) {
    res.json([]);
  });
};

function addUser(req, res) {
  res.send(500);
}
