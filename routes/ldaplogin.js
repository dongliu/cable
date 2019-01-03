var auth = require('../lib/auth');

module.exports = function (app) {
  app.get('/ldaplogin/', function (req, res) {
    res.render('ldaplogin');
  });

  app.post('/ldaplogin/', auth.ensureAuthenticated, function (req, res) {
    res.render('ldaplogin', {
      errorMessage: res.locals.error
    });
    delete res.locals.error;
  });
};

