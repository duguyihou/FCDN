import Router from 'koa-router';
import multer from '@koa/multer';
import fs from 'fs';
import path from 'path';

import {getUsersImagesData} from '../images/services';
import {findMatches} from './find-matches';
import {ensureLoggedIn, getUserId} from '../auth/services';
import {renderDashboardView} from '../dashboard/dashboard-controller';

const uploadMiddleware = multer().fields([{ name: 'file', maxCount: 1 }]);

const router = new Router<any, any>();
router.use(ensureLoggedIn);

function uploadedImagePath(userId: string) {
  fs.mkdirSync(path.join(__dirname, 'last-uploaded'), { recursive: true });
  return path.join(__dirname, 'last-uploaded', userId);
}

router.post('/recognition', uploadMiddleware, async ctx => {
  const id = getUserId(ctx);

  fs.writeFileSync(uploadedImagePath(id), ctx.files.file[0].buffer);

  const images = getUsersImagesData(id);

  const matchIndices = await findMatches(images.map(image => image.path), uploadedImagePath(id));
  const matchingNames = matchIndices.map(matchIndex => images[matchIndex].imageName);

  ctx.body = renderDashboardView({ images, matchingNames, recognitionComplete: true });
});

router.get('/recognition/last-processed-image', ctx => {
  const id = getUserId(ctx);

  ctx.set('Content-type', 'image/jpeg');
  ctx.body = fs.createReadStream(uploadedImagePath(id));
});

export default app => app.use(router.routes());