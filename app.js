const koa = require('koa')
    , co = require('co')
    , route = require('koa-route')
    , qs = require('qs')
    , features = require('./features')
    , buildClusterIndex = require('./lib/buildClusterIndex')
    , MongoClient = require('mongodb').MongoClient;


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
      let coll = yield feature.getCollection(this.db);
      if (debug) { console.time('buildIndex') }
      tileCache[cacheKey] = buildClusterIndex(coll);
      if (debug) { console.timeEnd('buildIndex') }
    }

    this.body = {
      tilejson: "2.1.0"
    }
  } else {
    this.status = 404;
  }
}));

co(function *() {
  const dbENV = 'MONGODB_URI'
      , dbURI = process.env[dbENV]
      , port = process.env.PORT || 3000;

  if (!dbURI) { throw `Missing ${dbENV} env variable!` }
  const db = yield MongoClient.connect(dbURI);
  app.context.db = db;

  app.listen(port);
  console.log(`Tile Server listening on port ${port}`);
}).catch(err => { console.log(err); });
