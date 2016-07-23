const koa = require('koa')
    , route = require('koa-route');
const app = koa();

app.use(require('koa-logger')());

app.use(route.get('/', function *() {
  this.body = 'hi!'
}));

app.listen(3000);
console.log('Tile Server listening on port 3000');
