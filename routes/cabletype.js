
exports.index = function(req, res){
  res.render('cabletype');
};

exports.all = function(req, res) {
  var mongoose = require('mongoose');
  var CableType = mongoose.model('CableType');
  CableType.find(function(err, docs) {
    if (err) {
      return res.send(500, err.message);
    }
    res.json(docs);
  });
};
