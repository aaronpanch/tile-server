const co = require('co')
    , debug = process.env.NODE_ENV === 'development'
    , request = require('request-promise');

function transformData(data) {
  if (debug) { console.time('transform'); }
  const collection = {
    type: 'FeatureCollection',
    features: data.filter(rental => (rental.lat && rental.lng)).map(rental => {
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ rental.lng, rental.lat ]
        },
        properties: {
          id: rental.id
        }
      }
    })
  }

  if (debug) { console.timeEnd('transform'); }

  return collection;
}

function getCollection(db, query) {
  return co(function *() {
    if (debug) { console.time('vacancies'); }

    const rentals = yield request.get('http://localhost:9292/rentals?api_version=1&per_page=0&view=marker');

    if (debug) { console.timeEnd('vacancies'); }

    return transformData(JSON.parse(rentals));
  });
}

module.exports = { getCollection }
