var fs = require('fs')
var prompt = require('prompt');
var Git = require("nodegit");


var config = require('../modes/robopaint-mode-template/replace-values.js');

console.log(config);
console.log("\n\n");

const files = Object.keys(config);

const initialPrompt = [
  {
    name: 'name',
    description: 'Name for mode, this must not have spaces. It will be used to name the mode folder',
    required: true
  }
];

var newModeInfo = {};

prompt.start();

prompt.addProperties(newModeInfo, initialPrompt, function (err) {
  console.log(`cloning repo to ${`robopaint-mode-${newModeInfo.name}`}`);
  Git.Clone("https://github.com/docprofsky/robopaint-mode-template", `robopaint-mode-${newModeInfo.name}`).then(function(repository) {
    // Work with the repository object here.
    console.log("Cloned it!");
  });
})


return;

openFiles(0);


function openFiles(i) {
  if (i === files.length) {
    console.log("Done processing.");
    return;
  }

  // The file we are working with
  const file = files[i];

  console.log(`openining file ${file}`);
  // CHANGEME: Read and write actual file

  var fileData = fs.readFileSync(`../modes/robopaint-mode-template/${file}`).toString();
  doFileConfig(config[file], fileData, 0, function (changedFileData) {
    console.log(`writing file ${file}\n`);
    console.log(`file data:\n${changedFileData}\n\n`);
    fs.writeFileSync(`../modes/robopaint-mode-template/${file}`, changedFileData);
    openFiles(i + 1);
  });
}


function doFileConfig(fileConfig, fileData, i, callback) {
  const fileFields =  Object.keys(fileConfig);
  if (i === fileFields.length) {
    if(callback) callback(fileData);
    return;
  }

  // The name of the text being replaed
  const field = fileFields[i];

  // The query to match the text to replace
  const query = fileConfig[field];

  // Get info from user if not already asked for
  if (newModeInfo.hasOwnProperty(field)) {
    changeFileData(fileData, query, newModeInfo[field], function (fileData) {
      doFileConfig(fileConfig, fileData, i + 1, callback);
    });
  } else {
    prompt.get(field, function (err, result) {
      newModeInfo[field] = result[field];
      changeFileData(fileData, query, newModeInfo[field], function (fileData) {
        doFileConfig(fileConfig, fileData, i + 1, callback);
      });
    });
  }
}


function changeFileData(fileData, query, replacement, callback) {
  // We are using RegEx to match the field
  if (query.constructor === RegExp) {
    fileData = fileData.replace(query, replacement);
  } else {
    // Parse the file as JSON and change the JSON, and save it as a string
    var changedObject = changeObjectValue(JSON.parse(fileData), query, replacement);
    fileData = JSON.stringify(changedObject, null, 2);
  }
  if (callback) callback(fileData);
}


// Use: changeObjectValue(testData, "info.name", "changedname thing");
function changeObjectValue(object, property, value) {
  var propertyPath = property.split('.');
  if (propertyPath.length > 1) {
    object[propertyPath[0]] = changeObjectValue(object[propertyPath[0]], propertyPath.slice(1).join(''), value);
    return object;
  } else {
    object[propertyPath[0]] = value;
    return object;
  }
}
