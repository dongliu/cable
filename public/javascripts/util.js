function Json2List(json) {
  var output = '';
  for (var k in json) {
    if (json.hasOwnProperty(k)) {
      if (typeof(json[k]) == 'object') {
        output = output + '<dl>' + '<dt>' + k + '</dt>' + '<dd>' + Json2List(json[k]) + '</dd>' + '</dl>';
      } else {
        output = output + '<b>' + k + '</b>' + ' : ' + json[k] + '<br/>';
      }
    }
  }
  return output;
}