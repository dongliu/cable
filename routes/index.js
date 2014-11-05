exports.main = function (req, res) {
  return res.render('manage', {
    roles: req.session.roles
  });

  // if (req.session.roles && req.session.roles.length) {
  //   return res.render('manage', {roles: req.session.roles});
  // } else {
  //   return res.render('main', {roles: req.session.roles});
  // }
};


exports.switch2normal = function (req, res) {
  return res.render('main', {
    roles: req.session.roles
  });
};


//TODO implement the cas 2.0 logout

exports.logout = function (req, res) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
  res.redirect('https://liud-dev.nscl.msu.edu/cas/logout');
};
