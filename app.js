
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  about = require('./routes/about'),
  admin = require('./routes/admin'),
  numbering = require('./routes/numbering'),
  // cabletype = require('./routes/cabletype'),
  // cable = require('./routes/cable'),
  http = require('http'),
  // Client = require('cas.js'),
  fs = require('fs'),
  role = require(__dirname + '/config/role.json'),
  sysSub = require(__dirname + '/config/sys-sub.json'),
  signal = require(__dirname + '/config/signal.json'),
  penetration = require(__dirname + '/config/penetration.json'),
  // url = require('url'),
  path = require('path');

var auth = require('./lib/auth');


var mongoose = require('mongoose');
var CableType = require('./model/meta.js').CableType;
var Request = require('./model/request.js').Request;
mongoose.connect('mongodb://localhost/cable');


var app = express();

var access_logfile = fs.createWriteStream('./logs/access.log', {flags: 'a'});

// var cas = new Client({
//   base_url: 'https://liud-dev.nscl.msu.edu/cas',
//   service: 'http://localhost:3000',
//   version: 1.0
// });

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  // app.use(express.logger({stream: access_logfile}));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'cable_secret',cookie: { maxAge: 14400000 }}));
  // app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/about', about.index);
app.get('/', auth.ensureAuthenticated, routes.main);

// init the user service
// GET /user/:id
// GET /username
require('./routes/user')(app);

// init the wbs services
// GET /wbs/:number
// GET /wbs/list
require('./routes/wbs')(app);

// init the cable services

require('./routes/cable')(app);

// app.get('/cabletype', cabletype.index);
// app.get('/cabletype/all', cabletype.all);
require('./routes/cabletype')(app);

// app.get('/requestform', cable.requestform);

app.get('/admin', auth.ensureAuthenticated, auth.verifyRole('admin'), admin.index);
app.get('/testrole', auth.ensureAuthenticated, auth.verifyRole('testrole'), admin.index);
app.get('/numbering', numbering.index);


app.get('/penetration', function(req, res) {
  res.json(penetration);
});


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


// function ensureAuthenticated(req, res, next) {
//   var ticketUrl = url.parse(req.url, true);
//   if (req.session.userid) {
//     // console.log(req.session);
//     if (req.query.ticket) {
//       // remove the ticket query param
//       delete ticketUrl.query.ticket;
//       res.redirect(301, url.format({
//         pathname: ticketUrl.pathname,
//         query: ticketUrl.query
//       }));
//     } else {
//       next();
//     }
//   } else if (req.query.ticket) {
//     cas.validate(req.query.ticket, function(err, status, userid) {
//       if (err) {
//         res.send(401, err.message);
//       } else {
//         req.session.userid = userid;
//         if (role[userid]) {
//           req.session.roles = role[userid];
//         } else {
//           req.session.roles = [];
//         }
//         next();
//       }
//     });
//   } else {
//     res.redirect('https://' + cas.hostname + cas.base_path + '/login?service=' + encodeURIComponent(cas.service));
//   }
// }


// function verifyRole(role) {
//   return function(req, res, next) {
//     // console.log(req.session);
//     if (req.session.roles) {
//       if (req.session.roles.indexOf(role) > -1) {
//         return next();
//       } else {
//         return res.send(403, "You are not authorized to access this resource. ");
//       }
//     } else {
//       console.log("Cannot find the user's role.");
//       return res.send(500, "something wrong for the user's session");
//     }
//   };
// }
