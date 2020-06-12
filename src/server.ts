import 'dotenv/config';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import glob from 'glob';

const app = new Koa<any>();
app.use(bodyParser());

const controllersRegistrators =
  glob.sync(path.join(__dirname, '**/*-controller.ts'))
    .map(controllerPath => require(controllerPath))
    .map(controller => controller.default);

for (const registerController of controllersRegistrators) {
  registerController(app);
}

app.listen(8080);
console.log('listening on port 8080');