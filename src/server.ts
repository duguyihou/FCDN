import 'dotenv/config';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import glob from 'glob';

const server = new Koa<any>();
server.use(bodyParser());

const controllersRegistrators =
  glob.sync(path.join(__dirname, '**/*-controller.ts'))
    .map(controllerPath => require(controllerPath))
    .map(controller => controller.default);

for (const registerController of controllersRegistrators) {
  registerController(server);
}

const port = process.env.PORT || 3000;

server.listen(port, () => console.log('listening on port ${port}'));
