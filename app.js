/*jslint es5:true*/

var express = require('express'),
  slash = require('express-slash'),
  routes = require('./routes'),
  about = require('./routes/about'),
  numbering = require('./routes/numbering'),
  http = require('http'),
  fs = require('fs'),
  sysSub = require(__dirname + '/config/sys-sub.json'),
  signal = require(__dirname + '/config/signal.json'),
  penetration = require(__dirname + '/config/penetration.json'),
  path = require('path');

var mongoose = require('mongoose');
mongoose.connection.close();
var CableType = require('./model/meta.js').CableType;
var Request = require('./model/request.js').Request;
var User = require('./model/user.js').User;
mongoose.connect('mongodb://localhost/cable_frib');

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection opened.');
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

var auth = require('./lib/auth');

var app = express();

var access_logfile = fs.createWriteStream('./logs/access.log', {
  flags: 'a'
});

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.logger({stream: access_logfile}));
  app.use(express.compress());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'cable_secret',
    cookie: {
      maxAge: 14400000
    }
  }));
  // app.use(multer({
  //   dest: uploadDir,
  //   limits: {
  //     files: 1,
  //     fileSize: 5 * 1024 * 1024
  //   }
  // }));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(app.router);
  app.use(slash());
});

app.configure('development', function () {
  app.use(express.errorHandler());
});


app.get('/about', about.index);
app.get('/', auth.ensureAuthenticated, routes.main);
app.get('/switch-to-normal', auth.ensureAuthenticated, routes.switch2normal);

// init the user service
// GET /users
// GET /users/newuser
// GET /users/:id
// PUT /users/:id
// GET /users/:id/json

require('./routes/user')(app);

// init the wbs services
// GET /wbs/:number
// GET /wbs/list
require('./routes/wbs')(app);


require('./routes/room')(app);



// init the cable services
// GET /requests
// POST /requests
// GET /requests/statuses/:s/json
// GET /requests/:id
// PUT /requests/:id
// GET /requests/:id/json

require('./routes/cable')(app);

// GET /cabletypes
// GET /cabletypes/json
require('./routes/cabletype')(app);

// GET /profile
require('./routes/profile')(app);

app.get('/numbering', numbering.index);


app.get('/penetration', function (req, res) {
  res.json(penetration);
});


app.get('/sys-sub', function (req, res) {
  res.json(sysSub);
});
app.get('/signal', function (req, res) {
  res.json(signal);
});


app.get('/logout', routes.logout);

var server = http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});


function cleanup() {
  server._connections = 0;
  server.close(function () {
    console.log("Closed out remaining connections.");
    // Close db connections, other chores, etc.
    mongoose.connection.close();
    process.exit();
  });

  setTimeout(function () {
    console.error("Could not close connections in time, forcing shut down");
    process.exit(1);
  }, 30 * 1000);

}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
