const co = require('co'),
      debug = process.env.NODE_ENV === 'development';

function transformData(data) {
  if (debug) { console.time('transform'); }

  const collection = {
    type: 'FeatureCollection',
    features: data.map(rental => {
      return {
        type: 'Feature',
        geometry: rental.location,
        properties: {
          id: rental.listable_uid
        }
      }
    })
  }

  if (debug) { console.timeEnd('transform'); }

  return collection;
}

function getCollection(db, query) {
  return co(function *() {
    if (debug) { console.time('database'); }

    const rentals = yield db.collection('rentals')
      .find(Object.assign({ location: { $exists: 1 } }))
      .project({ location: 1, listable_uid: 1 })
      .toArray();

    if (debug) { console.timeEnd('database'); }

    return transformData(rentals);
  });
}

module.exports = { getCollection }
