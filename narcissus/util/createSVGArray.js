var fs = require('fs');

var dirname = __dirname + '/svg3/'
console.log('dirname', dirname)
var svg = [];
var totalFrames = 68;
var frameCut = 1;
var total = totalFrames / frameCut;

readFiles(dirname, saveContent, function(err) { 
  console.error('error ', err);
});

async function readFiles(dirname, onError) {
  fs.readdir(dirname, async function(err, filenames) {
    console.log('filenames', filenames)
    if (err) {
      onError(err);
      return;
    }
    // total = filenames.length;
    for (let i = 0; i < totalFrames; i++ ) {
      if (i%frameCut == 0) await writeToOutput(dirname + filenames[i], i);
    }
  });
}

async function writeToOutput (filename, i) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filename, 'utf-8', function(err, content) {
      if (err) {
        reject(err);
        return;
      }
      resolve(saveContent(i, content))
    });
  })
}

function saveContent (index, data) {
  console.log('received', index)
  console.log('total is ' + total)
  // svg[index] = data;
  svg.push(data);
  console.log('l', svg.length, ( total - frameCut*2))
  if (svg.length > ( total - frameCut*2) ) {
    // console.log(svg)
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

