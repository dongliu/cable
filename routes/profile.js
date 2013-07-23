var mongoose = require('mongoose');
var User = mongoose.model('User');
var auth = require('../lib/auth');

module.exports = function(app) {
	app.get('/profile', auth.ensureAuthenticated, function(req, res) {
		// render the profile page
		User.findOne({id: req.session.userid}).lean().exec(function(err, user) {
      if (err) {
        console.error(err.msg);
        return res.send(500, 'something is wrong with the DB.');
      }
      return res.render('profile',{user: user});
    });
	});
};