function json2List(json) {
  var output = '<dl>';
  for (var k in json) {
    if (json.hasOwnProperty(k)) {
      if (typeof(json[k]) == 'object') {
        output = output + '<dl>' + '<dt>' + k + '</dt>' + '<dd>' + json2List(json[k]) + '</dd>' + '</dl>';
      } else {
        output = output + '<p><strong>' + k + '</strong> : ' + json[k] + '</p>';
      }
    }
  }
  output = output + '</dl>';
  return output;
}