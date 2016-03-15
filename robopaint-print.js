#!/usr/bin/env node
// Use this program to send a SVG to RoboPaint using the remote printing API

var http = require('http');
var program = require('commander');
var fs = require('fs');


program
  .version('0.0.1')
  .option('-s, --server <address>', 'CNCServer address', '127.0.0.1:4242')
  .option('-n, --name <name>', 'Job name', 'Print job')
  .arguments('<file>', 'SVG file to print')
  .action(function (file) {
    printFileName = file;
  });

program.parse(process.argv);


if (typeof printFileName === 'undefined') {
  console.log("Please provide a file to print.");
  return 0;
}

try {
fs.statSync(printFileName).isFile();
var printSVG = fs.readFileSync(printFileName).toString();
}
catch (e) {
  console.log("Error reading from file; Does it exist, and is it a file?");
  console.log(e);
}

var server = {  // RoboPaint server configuration information
  address: program.server.split(':')[0],  // Seperate the address from the port
  port: program.server.split(':')[1]
};

var requestOptions = {  // The request information
  host: server.address,
  port: server.port,
  path: '/robopaint/v1/print',
  method: 'POST',
  headers: {
         'Content-Type': 'application/json',
     }
};

var printData = { // The data for the print job
  options: {
    name: program.name
  },
  svg: printSVG
};


var post_req = http.request(requestOptions, function (res) {
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('Response: ' + chunk);
  });

  res.on('end', function () {
    console.log("Done sending print job.");
  });
});

 // post the data
 console.log("Sending the print job");
 post_req.write(JSON.stringify(printData));
 post_req.end();
