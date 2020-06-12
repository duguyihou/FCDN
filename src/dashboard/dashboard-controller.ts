import Router from 'koa-router';
import path from 'path';
import handlebars from 'handlebars';
import fs from 'fs';

import {getUsersImagesData} from '../images/services';
import {ensureLoggedIn, getUserId} from '../auth/services';

const router = new Router();

router.use(ensureLoggedIn);

/*
  Opens a dashboard.handlebars template file and converts it to HTML string.
  That HTML is eventually sent to the browser as response body.
 */
export function renderDashboardView(context: object) {
  const viewAbsolutePath = path.join(__dirname, 'dashboard.handlebars');
  const renderView = handlebars.compile(fs.readFileSync(viewAbsolutePath, { encoding: 'utf8' }));

  return renderView(context);
}

router.get('/', ctx => {
  const images = getUsersImagesData(getUserId(ctx));
  ctx.body = renderDashboardView({ images });
});

export default app => app.use(router.routes());