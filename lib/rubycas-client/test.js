var https = require('https');
var fs = require('fs');

var ticket = 'ST-1364498078rVO2ieqMYhvA10IBcVu';
// var sessionName = this.sessionName;
var service = encodeURIComponent('http://localhost:3000');
var path = '/cas' + '/serviceValidate?service=' + service + '&ticket=' + ticket;

var request = https.request({
  host: 'liud-dev.nscl.msu.edu',
  path: path,
  ca : [fs.readFileSync('server.crt')],
  method: 'GET'
}, function(response){
  var buf = '';
  var redirectUrl;
  response.on('data', function(chunk){
    buf += chunk.toString('utf8');
  });
  response.on('end', function(){
    var results = buf.split('\n');
    console.log(results);
  });
  response.on('error', function(err){
    console.log('response error: ' + err);
  });
});

request.on( 'error', function(err){
  console.log( 'error: ' + err );
});

request.end();