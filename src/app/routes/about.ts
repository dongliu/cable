
/*
 * GET about page.
 */

export = {
  index: function(req, res){
    res.render('about', { username: req.session.username});
  },
};
