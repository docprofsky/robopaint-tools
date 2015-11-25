var fs = require('fs')
var config = require('../modes/robopaint-mode-template/replace-values.js');

console.log(config);
console.log("\n\n");

var testData = {
  "_meta": {
    "creator": "docprofsky",
    "target": "en-US",
    "release": "0.0.1",
    "basetype": "mode"
  },
  "info": {
    "name": "name-text",
    "use": "use-text",
    "detail": "detail-text"
  }
};


for (var file in config) {
  console.log(`openining file ${file}`);
  // var fileData = fs.readFileSync(file).toString();
  for (var field in config[file]) {
    var query = config[file][field];

    // We are using RegEx to match the field
    if (query.constructor === RegExp) {
      // TODO: Replace with user info
      // fileData = fileData.replace(query, field + 'changed')

      // Parse the file as JSON and change the JSON
    } else {
      // TODO: Replace with user info
      // var changedObject = changeObjectValue(JSON.parse(fileData), query, field + 'changed');
      // fileData = JSON.stringify(changedObject, null, 2);
    }
  }
  console.log(`writing file ${file}\n`);
  // console.log(`file data:\n${fileData}`);
}


// changeObjectValue(testData, "info.name", "changedname thing");
function changeObjectValue(object, property, value) {
  var propertyPath = property.split('.');
  if (propertyPath.length > 1) {
    changeObjectValue(object[propertyPath[0]], propertyPath.slice(1).join(''), value);
  } else {
    object[propertyPath[0]] = value;
    return object;
  }
}
