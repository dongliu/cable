var fs = require('fs');
var csv = require('csv');

if (process.argv.length < 3) {
  console.error('usage: dump2termfrom.js input.csv [filter.txt]');
  process.exit(1);
}

try {
  var input = fs.openSync(process.argv[2], 'r');
} catch (err) {
  console.error(err);
  process.exit(1);
}

if (process.argv.length > 3) {
  try{
    var filter = fs.readFileSync(process.argv[3], 'UTF8').split('\n');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

var line = 0;

parser = csv.parse({
  trim: true
});

parser.on('readable', function () {
  var record = parser.read();

  if (line === 0) {
    console.log('number,from.readyForTerm,,from.terminatedOn,,from.terminatedBy,');
  }

  while (record) {
    line += 1;
    //console.error('Line: ' + line + ' read');
    if ((line > 1 && !filter) || (line > 1 && filter.indexOf(record[0]) !== -1)) {
      if (record[2] === 'TRUE' && record[5] === 'TRUE') {
        if (record[7] === '') {
          console.error('Line: ' + line + ': ' + record[0] + ': From (Rack) termination date is missing');
        } else {
          console.log(record[0] + ', TRUE, TRUE, ' + record[7] + ', ' + record[7] + ', Shaw Electric, Shaw Electric');
          //console.log(record[0] + ', _whatever_, TRUE, _whatever_, ' + record[7] + ', _whatever_, Shaw Electric');
        }
      }
    }
   
    record = parser.read();
  }
});

parser.on('error', function (err) {
  console.error(err.toString());
  process.exit(1);
});

parser.on('finish', function () {
  console.error('Finished parsing the csv file at ' + Date.now());
  process.exit();
});

fs.createReadStream('', { fd: input}).pipe(parser);
