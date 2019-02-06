/* tslint:disable:no-console */
import * as express from 'express';

import ldapClient = require('../lib/ldap-client');

import { User } from '../model/user';

import auth = require('../lib/auth');

const Roles = ['manager', 'admin'];

interface ADConfig {
  nameFilter: string;
  searchBase: string;
  searchFilter: string;
  objAttributes: string[];
  rawAttributes: string[];
}

let ad: ADConfig;

export function setADConfig(config: ADConfig) {
  ad = config;
}


function addUser(req: express.Request, res: express.Response) {
  const nameFilter = ad.nameFilter.replace('_name', req.body.name);
  const opts = {
    filter: nameFilter,
    attributes: ad.objAttributes,
    scope: 'sub',
  };

  ldapClient.search(ad.searchBase, opts, false, function (err, result) {
    if (err) {
      console.error(err.name + ' : ' + err.message);
      return res.status(500).json(err);
    }

    if (result.length === 0) {
      return res.status(404).send(req.body.name + ' is not found in AD!');
    }

    if (result.length > 1) {
      return res.status(400).send(req.body.name + ' is not unique!');
    }

    const roles = [];
    if (req.body.manager) {
      roles.push('manager');
    }
    if (req.body.admin) {
      roles.push('admin');
    }

    const user = new User({
      adid: result[0].sAMAccountName,
      name: result[0].displayName,
      email: result[0].mail,
      office: result[0].physicalDeliveryOfficeName,
      phone: result[0].telephoneNumber,
      mobile: result[0].mobile,
      roles: roles,
    });

    user.save(function (err, newUser: any) {
      if (err) {
        if (err.message) {
          console.error(err);
          return res.status(500).send(err.message);
        }
        console.log(err);
        return res.status(500).send('cannot save the new user in db.');
      }

      const url = req.protocol + '://' + req.get('host') + '/users/' + newUser.adid;
      res.set('Location', url);
      res.status(201).send('The new user is at <a href="' + url + '">here</a>');
    });

  });
}

function updateUserProfile(user, res: express.Response) {
  const searchFilter = ad.searchFilter.replace('_id', user.adid);
  const opts = {
    filter: searchFilter,
    attributes: ad.objAttributes,
    scope: 'sub',
  };
  ldapClient.search(ad.searchBase, opts, false, function (err, result) {
    if (err) {
      return res.status(500).json(err);
    }
    if (result.length === 0) {
      return res.status(500).json({
        error: user.adid + ' is not found!',
      });
    }
    if (result.length > 1) {
      return res.status(500).json({
        error: user.adid + ' is not unique!',
      });
    }
    const update: any = {
      name: result[0].displayName,
      email: result[0].mail,
      office: result[0].physicalDeliveryOfficeName,
      phone: result[0].telephoneNumber,
    };

    if (result[0].mobile !== undefined) {
      update.mobile = result[0].mobile;
    }

    user.update(update, function (err) {
      if (err) {
        return res.status(500).json(err);
      }
      res.send(204);
    });
  });
}

export function init(app: express.Application) {

  app.get('/users/', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send('only admin allowed');
    }
    return res.render('users');
  });

  app.get('/usernames/:name', auth.ensureAuthenticated, function (req, res) {
    User.findOne({
      name: req.params.name
    }).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      if (user) {
        return res.render('user', {
          user: user,
          myRoles: req.session.roles,
        });
      }
      return res.status(404).send(req.params.name + ' not found');
    });
  });

  app.post('/users/', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send('only admin allowed');
    }

    if (!req.body.name) {
      return res.status(400).send('need to know name');
    }

    // check if already in db
    User.findOne({
      name: req.body.name,
    }).lean().exec(function (err, user) {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (user) {
        const url = req.protocol + '://' + req.get('host') + '/users/' + user.adid;
        return res.status(200).send('The user is at ' + url);
      }
      addUser(req, res);
    });
  });



  app.get('/users/json', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send("You are not authorized to access this resource. ");
    }
    User.find().lean().exec(function (err, users) {
      if (err) {
        return res.status(500).json({
          error: err.message,
        });
      }
      res.json(users);
    });
  });


  app.get('/users/:id/', auth.ensureAuthenticated, function (req, res) {
    User.findOne({
      adid: req.params.id,
    }).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      if (user) {
        return res.render('user', {
          user: user,
          myRoles: req.session.roles,
        });
      }
      return res.status(404).send(req.params.id + ' has never logged into the application.');
    });
  });

  app.put('/users/:id/', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send("You are not authorized to access this resource. ");
    }
    if (!req.is('json')) {
      return res.status(415).send('json request expected.');
    }
    User.findOneAndUpdate({
      adid: req.params.id,
    }, req.body).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: err.message,
        });
      }
      if (user) {
        return res.send(204);
      }
      return res.status(404).send('cannot find user ' + req.params.id);
    });
  });


  app.post('/users/:id/wbs/', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send("You are not authorized to access this resource. ");
    }
    if (!req.is('json')) {
      return res.status(415).send('json request expected.');
    }
    User.findOne({
      adid: req.params.id,
    }).exec(function (err, user: any) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      if (!user) {
        return res.status(404).send('cannot find user ' + req.params.id);
      }
      if (user.wbs === undefined) {
        user.wbs = [];
      }
      user.wbs.addToSet(req.body.newwbs);
      user.save(function (err) {
        if (err) {
          console.error(err);
          return res.status(500).send(err.message);
        }
        return res.status(201).send(req.body.newwbs + ' was added to the wbs list.');
      });
    });
  });

  app.delete('/users/:id/wbs/:wbs', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send("You are not authorized to access this resource. ");
    }
    User.findOne({
      adid: req.params.id,
    }).exec(function (err, user: any) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      if (!user) {
        return res.status(404).send('cannot find user ' + req.params.id);
      }
      if (user.wbs === undefined) {
        return res.send(204);
      }
      user.wbs.pull(req.params.wbs);
      user.save(function (err) {
        if (err) {
          console.error(err);
          return res.status(500).send(err.message);
        }
        return res.send(204);
      });
    });
  });

  // get from the db not ad
  app.get('/users/:id/json', auth.ensureAuthenticated, function (req, res) {
    User.findOne({
      adid: req.params.id,
    }).lean().exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          error: err.mesage,
        });
      }
      return res.json(user);
    });
  });

  app.get('/users/:id/refresh', auth.ensureAuthenticated, function (req, res) {
    if (req.session.roles === undefined || req.session.roles.indexOf('admin') === -1) {
      return res.status(403).send("You are not authorized to access this resource. ");
    }
    User.findOne({
      adid: req.params.id,
    }).exec(function (err, user) {
      if (err) {
        console.error(err);
        return res.status(500).send(err.message);
      }
      if (user) {
        updateUserProfile(user, res);
      } else {
        return res.status(404).send(req.params.id + ' is not in the application.');
      }
    });
  });


  // resource /adusers

  app.get('/adusers/:id/', auth.ensureAuthenticated, function (req, res) {

    const searchFilter = ad.searchFilter.replace('_id', req.params.id);
    const opts = {
      filter: searchFilter,
      attributes: ad.objAttributes,
      scope: 'sub',
    };
    ldapClient.search(ad.searchBase, opts, false, function (err, result) {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length === 0) {
        return res.status(500).json({
          error: req.params.id + ' is not found!',
        });
      }
      if (result.length > 1) {
        return res.status(500).json({
          error: req.params.id + ' is not unique!',
        });
      }

      return res.json(result[0]);
    });

  });


  app.get('/adusers/:id/photo', auth.ensureAuthenticated, function (req, res) {

    const searchFilter = ad.searchFilter.replace('_id', req.params.id);
    const opts = {
      filter: searchFilter,
      attributes: ad.rawAttributes,
      scope: 'sub',
    };
    ldapClient.search(ad.searchBase, opts, true, function (err, result) {
      if (err) {
        return res.status(500).json(err);
      }
      if (result.length === 0) {
        return res.status(500).json({
          error: req.params.id + ' is not found!',
        });
      }
      if (result.length > 1) {
        return res.status(500).json({
          error: req.params.id + ' is not unique!',
        });
      }
      res.set('Content-Type', 'image/jpeg');
      return res.send(result[0].thumbnailPhoto);
    });

  });

  app.get('/adusernames', auth.ensureAuthenticated, function (req, res) {
    const query = req.query.term;
    let nameFilter;
    let opts;
    if (query && query.length > 0) {
      nameFilter = ad.nameFilter.replace('_name', query + '*');
    } else {
      nameFilter = ad.nameFilter.replace('_name', '*');
    }
    opts = {
      filter: nameFilter,
      attributes: ['displayName'],
      scope: 'sub',
    };
    ldapClient.search(ad.searchBase, opts, false, function (err, result) {
      if (err) {
        return res.status(500).json(err.message);
      }
      if (result.length === 0) {
        return res.json([]);
      }
      return res.json(result);
    });
  });
}
