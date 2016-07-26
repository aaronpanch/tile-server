const co = require('co');

function transformData(data) {
  if (process.env.DEBUG) { console.time('transform'); }

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

  if (process.env.DEBUG) { console.timeEnd('transform'); }

  return collection;
}

function getCollection(db, query) {
  return co(function *() {
    if (process.env.DEBUG) { console.time('database'); }

    const rentals = yield db.collection('rentals')
      .find(Object.assign({ location: { $exists: 1 } }))
      .project({ location: 1, listable_uid: 1 })
      .toArray();

    if (process.env.DEBUG) { console.timeEnd('database'); }

    return transformData(rentals);
  });
}

module.exports = { getCollection }
