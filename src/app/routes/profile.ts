/* tslint:disable:no-console */

import * as express from 'express';
import mongoose = require('mongoose');

const User = mongoose.model('User');
import auth = require('../lib/auth');

export function init(app: express.Application) {
  app.get('/profile', auth.ensureAuthenticated, function (req: express.Request, res: express.Response, next: express.NextFunction) {
    // render the profile page
    User.findOne({
      adid: req.session.userid,
    }).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).send('something is wrong with the DB.');
      }
      return res.render('profile', {
        user: user,
      });
    });
  });

  // user update her/his profile. This is a little different from the admin update the user's roles.
  app.put('/profile', auth.ensureAuthenticated, function (req, res) {
    if (!req.is('json')) {
      return res.status(415).json({
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
        return res.status(500).json({
          error: err.message,
        });
      }
      res.send(204);
    });
  });
}
