const supercluster = require('supercluster');

module.exports = function (data) {
  return supercluster({
    radius: 300,
    maxZoom: 14,
    extent: 4096
  }).load(data.features);
}
