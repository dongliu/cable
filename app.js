/*jslint es5:true*/

var express = require('express');
var slash = require('express-slash');
var routes = require('./routes');
var about = require('./routes/about');
var numbering = require('./routes/numbering');
var https = require('https');
var fs = require('fs');
var sysSub = require(__dirname + '/config/sys-sub.json');
var penetration = require(__dirname + '/config/penetration.json');
var path = require('path');

var rotator = require('file-stream-rotator');

var mongoose = require('mongoose');
mongoose.connection.close();

require('./model/meta.js');
require('./model/request.js');
require('./model/user.js');

var mongoOptions = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5,
    socketOptions: {
      connectTimeoutMS: 30000,
      keepAlive: 1
    }
  }
};

var mongoAddress = 'mongodb://localhost/cable_frib';

if (process.env.MONGO_CONFIG) {
  var mongoConfig = require(__dirname + '/config/mongo.json');
  mongoAddress = 'mongodb://' + mongoConfig.server_address + ':' + mongoConfig.server_port + '/' + mongoConfig.db_name;
  if (mongoConfig.username) {
    mongoOptions.user = mongoConfig.username;
  }
  if (mongoConfig.password) {
    mongoOptions.pass = mongoConfig.password;
  }
  if (mongoConfig.auth) {
    mongoOptions.auth = mongoConfig.auth;
  }
}

mongoose.connect(mongoAddress, mongoOptions);

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection opened.');
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

var adClient = require('./lib/ldap-client').client;

var auth = require('./lib/auth');

var app = express();

app.enable('strict routing');

if (app.get('env') === 'production') {
  var access_logfile = rotator.getStream({
    filename: __dirname + '/logs/access.log',
    frequency: 'daily'
  });
}

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  if (app.get('env') === 'production') {
    app.use(express.logger({
      stream: access_logfile
    }));
  }
  app.use(express.compress());
  app.use(express.static(path.join(__dirname, 'public'), {maxAge: 48 * 60 * 60 * 1000}));
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  if (app.get('env') === 'development') {
    app.use(express.logger('dev'));
  }
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'cable_secret',
    cookie: {
      maxAge: 36 * 60 * 60 * 1000
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

app.locals.orgName = 'Lab';

app.configure('development', function () {
  app.use(express.errorHandler());
});


app.get('/about', about.index);
app.get('/', auth.ensureAuthenticated, routes.main);
app.get('/login', auth.ensureAuthenticated, function (req, res) {
  if (req.session.userid) {
    return res.redirect('/');
  }
  // something wrong
  res.send(400, 'please enable cookie in your browser');
});

app.get('/main', auth.ensureAuthenticated, routes.switch2normal);

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

require('./routes/ldaplogin')(app);

app.get('/numbering', numbering.index);


app.get('/penetration', function (req, res) {
  res.json(penetration);
});


app.get('/sys-sub', function (req, res) {
  res.json(sysSub);
});

app.get('/logout', routes.logout);


var appCredentials = {
  key: fs.readFileSync('./config/server.key'),
  cert: fs.readFileSync('./config/server.crt')
};

var appPort = app.get('port');
var server = https.createServer(appCredentials, app).listen(appPort, function () {
  console.log('Express server listening on ssl port ' + appPort);
});

function cleanup() {
  server._connections = 0;
  mongoose.connection.close();
  adClient.unbind(function () {
    console.log('ldap client stops.');
  });
  server.close(function () {
    console.log('Express server close.');
    process.exit();
  });

  setTimeout(function () {
    console.error('Could not close connections in time, forcing shut down');
    process.exit(1);
  }, 30 * 1000);

}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
