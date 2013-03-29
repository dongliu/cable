
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  about = require('./routes/about'),
  // user = require('./routes/user'),
  http = require('http'),
  Client = require('./lib/cas-client.js'),
  // CAS = require('xcas'),
  // cas = require('grand_master_cas'),
  // cas_validate = require('cas_validate'),
  // querystring = require('querystring'),
  path = require('path');

var app = express();

var cas = new Client({
  base_url: 'https://liud-dev.nscl.msu.edu/cas',
  service: 'http://localhost:3000',
  version: 1.0
});

// cas.configure({
//   casHost: "liud-dev.nscl.msu.edu",   // required
//   casPath: "/cas",                  // your cas login route (defaults to "/cas")
//   ssl: true,                        // is the cas url https? defaults to false
//   port: 443,                        // defaults to 80 if ssl false, 443 if ssl true
//   service: "http://localhost:3000", // your site
//   sessionName: "cas_user",          // the cas user_name will be at req.session.cas_user (this is the default)
//   renew: false,                     // true or false, false is the default
//   gateway: false,                   // true or false, false is the default
//   redirectUrl: '/about'            // the route that cas.blocker will send to if not authed. Defaults to '/'
// });

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('cable_secret'));
  app.use(express.session());
  // app.use(cas_validate.redirect({'cas_host':'https://35.8.35.139/cas'}))
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// var auth = cas.getMiddleware('https://35.8.35.139/cas', 'http://localhost:3000');

app.get('/about', about.index);
app.get('/', ensureAuthenticated, routes.main);
app.get('/logout', routes.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


function ensureAuthenticated(req, res, next) {
  if (req.session.username) {
    next();
  } else if (req.param('ticket')) {
    cas.validate(req.param('ticket'), function(err, status, username) {
      if (err) {
        res.send(401, err.message);
      } else {
        req.session.username = username;
        next();
      }
    });
  } else {
    res.redirect('https://' + cas.hostname + cas.base_path + '/login?service=' + encodeURIComponent(cas.service));
  }
}