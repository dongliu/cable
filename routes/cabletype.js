
var mongoose = require('mongoose');
var CableType = mongoose.model('CableType');


module.exports = function(app) {
  app.get('/cabletypes', function(req, res) {
    res.render('cabletype');
  });

  app.get('/cabletype/json', function(req, res) {
    CableType.find(function(err, docs) {
      if (err) {
        return res.send(500, err.message);
      }
      res.json(docs);
    });
  });

  app.get('/cabletype/:name/json');
};

// exports.index = function(req, res){
//   res.render('cabletype');
// };

exports.all = function(req, res) {
  CableType.find(function(err, docs) {
    if (err) {
      return res.send(500, err.message);
    }
    res.json(docs);
  });
};

exports.findOne = function(req, res) {
  CableType.findOne({name: req})
}