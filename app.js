const koa = require('koa')
    , co = require('co')
    , route = require('koa-route')
    , qs = require('qs')
    , vtpbf = require('vt-pbf')
    , features = require('./features')
    , buildClusterIndex = require('./lib/buildClusterIndex')
    , MongoClient = require('mongodb').MongoClient;


const PORT = process.env.PORT || 3000
    , HOST_URL = process.env.HOST_URL || `http://localhost:${PORT}`;

const app = koa();

const debug = app.env === 'development';
if (debug) {
  app.use(require('koa-logger')());
}

app.use(function *(next) {
  this.set('Access-Control-Allow-Origin', '*');
  yield next;
});

let tileCache = {};

app.use(route.get('/:resource', function *(resource) {
  let feature = features[resource];

  if (feature) {
    const cacheKey = this.querystring || 'all';

    if (!tileCache[cacheKey]) {
      let coll = yield feature.getCollection(this.db, this.querystring);
      if (debug) { console.time('buildIndex') }
      tileCache[cacheKey] = buildClusterIndex(coll);
      if (debug) { console.timeEnd('buildIndex') }
    }

    this.body = {
      tilejson: '2.1.0',
      tiles: [
        `${HOST_URL}/${resource}/{z}/{x}/{y}?${this.querystring}`
      ]
    }
  } else {
    this.status = 404;
  }
}));

app.use(route.get('/:resource/:z/:x/:y', function *(resource, z, x, y) {
  let tileIndex = tileCache[this.querystring || 'all'];

  if (!tileIndex) {
    this.status = 404;
    return;
  }

  let tile = tileIndex.getTile(Number(z), Number(x), Number(y));
  if (!tile) {
    tile = { features: [] }
  }

  this.body = vtpbf.fromGeojsonVt({ [resource]: tile });
}));

co(function *() {
  // const dbENV = 'MONGODB_URI'
  //     , dbURI = process.env[dbENV];

  // if (!dbURI) { throw `Missing ${dbENV} env variable!` }
  // const db = yield MongoClient.connect(dbURI);
  // app.context.db = db;

  app.listen(PORT);
  console.log(`Tile Server listening on port ${PORT}`);
}).catch(err => { console.log(err); });
