const koa = require('koa')
    , co = require('co')
    , route = require('koa-route')
    , MongoClient = require('mongodb').MongoClient;

const app = koa();

app.use(require('koa-logger')());

app.use(route.get('/', function *() {
  this.body = 'hi!'
}));

co(function *() {
  const db = yield MongoClient.connect('mongodb://localhost:27017/vacancies-dev');
  app.context.db = db;

  app.listen(3000);
  console.log('Tile Server listening on port 3000');
}).catch(err => { console.log(err); });
