
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  about = require('./routes/about'),
  admin = require('./routes/admin'),
  numbering = require('./routes/numbering'),
  cabletype = require('./routes/cabletype'),
  cable = require('./routes/cable'),
  http = require('http'),
  Client = require('cas.js'),
  fs = require('fs'),
  role = require(__dirname + '/config/role.json'),
  sysSub = require(__dirname + '/config/sys-sub.json'),
  signal = require(__dirname + '/config/signal.json'),
  path = require('path');


var mongoose = require('mongoose');
// the model is called CableType
var CableType = require('./model/meta.js').CableType;
mongoose.connect('mongodb://localhost/cable');


var app = express();

var access_logfile = fs.createWriteStream('./logs/access.log', {flags: 'a'});

var cas = new Client({
  base_url: 'https://liud-dev.nscl.msu.edu/cas',
  service: 'http://localhost:3000',
  version: 1.0
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  // app.use(express.logger({stream: access_logfile}));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('cable_secret'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/about', about.index);
app.get('/', ensureAuthenticated, routes.main);

// init the user service
// GET /user/:id
// GET /username
require('./routes/user')(app);

app.get('/requestform', cable.requestform);

app.get('/admin', ensureAuthenticated, verifyRole('admin'), admin.index);
app.get('/testrole', ensureAuthenticated, verifyRole('testrole'), admin.index);
app.get('/numbering', numbering.index);

app.get('/cabletype', cabletype.index);
app.get('/cabletype/all', cabletype.all);


app.get('/sys-sub', function(req, res) {
  res.json(sysSub);
});
app.get('/signal', function(req, res) {
  res.json(signal);
});


app.get('/logout', routes.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


function ensureAuthenticated(req, res, next) {
  if (req.session.userid) {
    next();
  } else if (req.param('ticket')) {
    cas.validate(req.param('ticket'), function(err, status, userid) {
      if (err) {
        res.send(401, err.message);
      } else {
        if (status) {
          req.session.userid = userid;
          req.session.roles = role[req.session.userid];
          next();
        }
      }
    });
  } else {
    res.redirect('https://' + cas.hostname + cas.base_path + '/login?service=' + encodeURIComponent(cas.service));
  }
}

function verifyRole(role) {
  return function(req, res, next) {
    if (req.session.roles) {
      if (req.session.roles.indexOf(role) > -1) {
        next();
      } else {
        res.send(403, "You are not authorized to access this resource. ");
      }

    } else {
      console.log("Cannot identify the user's role.");
      res.redirect(cas.service);
    }
  };
}

// function verifyRole(role, req, res, next) {
//   if (req.session.roles) {
//     if (req.ession.roles.indexOf(role) > -1) {
//       next();
//     } else {
//       res.send(403, "You are not authorized to access this resource. ");
//     }

//   } else {
//     console.log("Cannot identify the user's role.");
//     res.redirect(cas.service);
//   }
// }