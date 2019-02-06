/* tslint:disable:no-console */
import * as express from 'express';

interface AuthConfig {
  cas: string;
}

let authConfig: AuthConfig;

export function setAuthConfig(config: AuthConfig) {
  authConfig = config;
}

export function main(req: express.Request, res: express.Response) {
  if (req.session.roles && req.session.roles.length) {
    return res.render('manager', {
      roles: req.session.roles,
    });
  }
  return res.render('main', {
    roles: req.session.roles,
  });
}


export function switch2normal(req, res) {
  return res.render('main', {
    roles: req.session.roles,
  });
}


//TODO implement the cas 2.0 logout

export function logout(req: express.Request, res: express.Response) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
  res.redirect(authConfig.cas + '/logout');
}
