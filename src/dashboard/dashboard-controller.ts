import Router from 'koa-router';
import path from 'path';
import handlebars from 'handlebars';
import fs from 'fs';

import {getUsersImagesData} from '../images/services';
import {ensureLoggedIn, getUserId} from '../auth/services';
import {renderDatabaseView} from '../database/database-controller'
import {renderDetectionView} from '../recognition/recognition-controller'
import { renderRealTimeView } from '../realtime/realtime-controller';

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

router.get('/database', ctx => {
  const images = getUsersImagesData(getUserId(ctx));
  ctx.body = renderDatabaseView({ images });
});

router.get('/detection', ctx => {
  const images = getUsersImagesData(getUserId(ctx));
  ctx.body = renderDetectionView({ images });
});

router.get('/realtime', ctx => {
  const images = getUsersImagesData(getUserId(ctx));
  ctx.body = renderRealTimeView({ images });
});

export default app => app.use(router.routes());