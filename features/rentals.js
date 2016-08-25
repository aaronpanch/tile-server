const co = require('co')
    , debug = process.env.NODE_ENV === 'development'
    , noFalsy = require('lodash/pickBy')
    , request = require('request-promise');

function transformData(data) {
  if (debug) { console.time('transform'); }
  const collection = {
    type: 'FeatureCollection',
    features: data.filter(rental => (rental.lat && rental.lng)).map(rental => {
      const properties = noFalsy({
        id: rental.id,
        ratio: rental.default_photo && rental.default_photo.size,
        thumbnail: rental.default_photo && rental.default_photo.thumbnail
      });

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [ rental.lng, rental.lat ]
        },
        properties
      }
    })
  }

  if (debug) { console.timeEnd('transform'); }

  return collection;
}

function getCollection(db, query) {
  return co(function *() {
    if (debug) { console.time('vacancies'); }

    const rentals = yield request.get(`${process.env.VACANCIES_HOST}/rentals?api_version=1&per_page=0&fields=id,lat,lng,default_photo{thumbnail,size}&${query}`);

    if (debug) { console.timeEnd('vacancies'); }

    return transformData(JSON.parse(rentals));
  });
}

module.exports = { getCollection }
