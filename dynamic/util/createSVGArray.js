var fs = require('fs');

var dirname = __dirname + '/svg/'
console.log('dirname', dirname)
var svg = [];
var total = 0;

readFiles(dirname, saveContent, function(err) { 
  console.error('error ', err);
});

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    console.log('filenames')
    if (err) {
      onError(err);
      return;
    }
    total = filenames.length;
    for (let i = 0; i < total; i++ ) {
      fs.readFile(dirname + filenames[i], 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(i, content)
      });
    }
  });
}

function saveContent (index, data) {
  // console.log('received', index, data)
  svg[index] = data;
  if (svg.length === total) {
    console.log(svg)
    console.log(svg.length, total)
    console.log('finished')
    writeFinal()
  }
}

function writeFinal () {
  var outputFile = __dirname + '/output.json';
  console.log('writing to ', outputFile)
  fs.writeFile(outputFile, JSON.stringify(svg), function(err, result) {
    console.log('tried to write ', err, result)
  });
}

