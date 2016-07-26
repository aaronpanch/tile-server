const koa = require('koa')
    , co = require('co')
    , route = require('koa-route')
    , MongoClient = require('mongodb').MongoClient;

const app = koa();

if (app.env === 'development') {
  app.use(require('koa-logger')());
}

app.use(route.get('/', function *() {
  this.body = 'hi!'
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
