
/*
 * GET about page.
 */

exports.index = function(req, res){
  res.render('about', { userid: req.session.userid});
};