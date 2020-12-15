const Koa = require('koa');
const app = new Koa();
const Router = require('@koa/router');
const router = new Router();
const logger = require('koa-logger');
const bodyparser = require('koa-bodyparser');
const {oas} = require('koa-oas3');

app.use(bodyparser());
app.use(logger());
app.use(async(ctx, next) => {
  const mw = await oas({
    file: `${__dirname}/petshop.json`,
    uiEndpoint: '/explorer',
    validatePaths: ['/pets'],
    validationOptions: {requestBodyAjvOptions: {allErrors: true}}
  });
  return mw(ctx, next);
});

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// middle is not in api spec, but doesn't fail validation
app.use( async(ctx, next) => {
  if(ctx.request.body.name.middle) {
    ctx.throw(400, 'Middle is not allowed');
  }
  await next();
})

router.post('/pets', (ctx) =>{
  const {name} = ctx.request.body;
  const petName = typeof name === 'string' ? name : JSON.stringify(name);
  ctx.body = `${petName} created`;
});

app.use(router.routes());

app.listen(3001, (serverPort = 3001) => {
  console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
  console.log('Swagger-ui is available on http://localhost:%d/explorer', serverPort);
});

module.exports = app;
