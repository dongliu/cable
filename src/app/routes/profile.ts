/* tslint:disable:no-console */
import mongoose = require('mongoose');
const User = mongoose.model('User');
import auth = require('../lib/auth');

export default function(app) {
  app.get('/profile', auth.ensureAuthenticated, function (req, res) {
    // render the profile page
    User.findOne({
      adid: req.session.userid,
    }).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.send(500, 'something is wrong with the DB.');
      }
      return res.render('profile', {
        user: user,
      });
    });
  });

  // user update her/his profile. This is a little different from the admin update the user's roles.
  app.put('/profile', auth.ensureAuthenticated, function (req, res) {
    if (!req.is('json')) {
      return res.json(415, {
        error: 'json request expected.',
      });
    }
    User.findOneAndUpdate({
      adid: req.session.userid,
    }, {
      subscribe: req.body.subscribe,
    }).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: err.message,
        });
      }
      res.send(204);
    });
  });
}
