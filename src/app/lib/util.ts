/*a simple middlewere to check if the request contains required properties*/
function filterBody(strings) {
  return function (req, res, next) {
    let k;
    let found = false;
    for (k in req.body) {
      if (req.body.hasOwnProperty(k)) {
        if (strings.indexOf(k) !== -1) {
          found = true;
        } else {
          req.body[k] = null;
        }
      }
    }
    if (found) {
      next();
    } else {
      return res.send(400, 'cannot find required information in body');
    }
  };
}

export = {
  filterBody: filterBody,
};
