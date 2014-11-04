var numbering = require('../config/sys-sub.json');


/**
 * encode category, subcatogory, and signal to name code
 * @param  {string}   cat
 * @param  {string}   sub
 * @param  {string}   sig
 * @return  {string[]}   the three codes, an array with less than three elements indicates error.
 */

function nameEncoding(cat, sub, sig) {
  var c, b, g;
  var result = [];
  for (c in numbering) {
    if (numbering.hasOwnProperty(c) && numbering[c].name === cat) {
      result.push(c);
      for (b in numbering[c].subcategory) {
        if (numbering[c].subcategory.hasOwnProperty(b) && numbering[c].subcategory[b] === sub) {
          result.push(b);
        }
      }
      if (result.length !== 2) {
        return result;
      }
      for (g in numbering[c].signal) {
        if (numbering[c].signal.hasOwnProperty(g) && numbering[c].signal[g].name === sig) {
          result.push(g);
          return result;
        }
      }
      return result;
    }
  }
  return result;
}

module.exports = {
  encode: nameEncoding
};
