var sysSub = require('../config/sys-sub.json');
var signal = require('../config/signal.json');


exports.requestform = function(req, res) {
  res.render('requestform', {sysSub: sysSub, signal: signal});
};