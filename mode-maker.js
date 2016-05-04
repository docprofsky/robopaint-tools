#!/usr/bin/env node
var fs = require('fs')
var prompt = require('prompt');
var Git = require("nodegit");
var rimraf = require('rimraf');


var config, files;


const initialPrompt = [
  {
    name: 'name',
    description: 'Name for mode, this must not have spaces. It will be used to name the mode folder\nDo not preface with robopaint-mode',
    required: true
  }
];

var newModeInfo = {};
var modeFolderName = '';

prompt.start();

prompt.addProperties(newModeInfo, initialPrompt, function (err) {
  modeFolderName = `robopaint-mode-${newModeInfo.name}`;
  console.log(`cloning repo to ${modeFolderName}`);
  Git.Clone("https://github.com/docprofsky/robopaint-mode-template", modeFolderName).then(function(repository) {
    console.log("Cloned it!");

    config = require(`./${modeFolderName}/replace-values.js`);
    files = Object.keys(config.replace);

    openFiles(0, function () {
      prepareModeFolder(config.files, modeFolderName, newModeInfo.name, 0, function () {
        console.log("Done processing.");
      });
    });
  });
})



function openFiles(i, callback) {
  if (i === files.length) {
    if(callback) callback();
    return;
  }

  // The file we are working with
  const file = files[i];

  var fileData = fs.readFileSync(`${modeFolderName}/${file}`).toString();
  doFileConfig(config.replace[file], fileData, 0, function (changedFileData) {
    fs.writeFileSync(`${modeFolderName}/${file}`, changedFileData);
    openFiles(i + 1, callback);
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


function prepareModeFolder(modeFiles, modeDir, modeName, i, callback) {
  const renameLength = modeFiles.rename.length;
  if(i === renameLength + modeFiles.delete.length) {
    if(callback) callback();
    return;
  }

  // We are renaming the files
  if(i < renameLength) {
    const oldPath = `${modeDir}/${modeFiles.rename[i]}`;
    const newPath = `${modeDir}/${modeFiles.rename[i].replace('template', modeName)}`;
    fs.rename(oldPath, newPath, function (err) {
      if (err) throw err;
      prepareModeFolder(modeFiles, modeDir, modeName, i + 1, callback);
    });
  } else {
    const deletePath = `${modeDir}/${modeFiles.delete[i - renameLength]}`;
    rimraf(deletePath, function (err) {
      if (err) throw err;
      prepareModeFolder(modeFiles, modeDir, modeName, i + 1, callback);
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
