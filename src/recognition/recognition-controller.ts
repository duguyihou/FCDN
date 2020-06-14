import Router from 'koa-router';
import multer from '@koa/multer';
import fs from 'fs';
import handlebars from 'handlebars';
import path from 'path';

import {getUsersImagesData} from '../images/services';
import {findMatches, displayDetectionBoxes} from './find-matches';
import {ensureLoggedIn, getUserId} from '../auth/services';
import {renderDashboardView} from '../dashboard/dashboard-controller';

const uploadMiddleware = multer().fields([{ name: 'file', maxCount: 1 }]);

const router = new Router<any, any>();
router.use(ensureLoggedIn);

function uploadedImagePath(userId: string) {
  fs.mkdirSync(path.join(__dirname, 'last-uploaded'), { recursive: true });
  return path.join(__dirname, 'last-uploaded', userId);
}

export function renderDetectionView(context: object) {
  const viewAbsolutePath = path.join(__dirname, 'detection.handlebars');
  const renderView = handlebars.compile(fs.readFileSync(viewAbsolutePath, { encoding: 'utf8' }));

  return renderView(context);
}

router.post('/recognition', uploadMiddleware, async ctx => {
  const id = getUserId(ctx);

  fs.writeFileSync(uploadedImagePath(id), ctx.files.file[0].buffer);

  const images = getUsersImagesData(id);

  const matchIndices = await findMatches(images.map(image => image.path), uploadedImagePath(id));
  const detectFaces = await displayDetectionBoxes(images.map(image => image.path), uploadedImagePath(id));
  const matchingNames = matchIndices.map(matchIndex => images[matchIndex].imageName);

  ctx.body = renderDetectionView({ images, matchingNames, recognitionComplete: true, detectFaces});
});

router.get('/recognition/last-processed-image', ctx => {
  const id = getUserId(ctx);

  ctx.set('Content-type', 'image/jpeg');
  ctx.body = fs.createReadStream(uploadedImagePath(id));
});

export default app => app.use(router.routes());