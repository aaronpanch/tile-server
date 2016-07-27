const fs = require('fs')
    , path = require("path");

let features = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    features[file.replace(/\.js$/i, '')] = require(path.join(__dirname, file));
  });

  module.exports = features;
