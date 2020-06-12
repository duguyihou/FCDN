import fs from 'fs';
import Router from 'koa-router';
import multer from '@koa/multer';
import {deleteImage, getImagePath, saveImage} from './services';
import {ensureLoggedIn, getUserId} from '../auth/services';

const router = new Router<any, any>();

router.use(ensureLoggedIn);

router.get('/images/:imageName', ctx => {
  const { imageName } = ctx.params;
  const userId = getUserId(ctx);

  ctx.set('Content-type', 'image/jpeg');
  ctx.body = fs.createReadStream(getImagePath(userId, imageName));
});

const uploadMiddleware = multer().fields([{ name: 'file', maxCount: 1 }]);

router.post('/images', uploadMiddleware, ctx => {
    const id = getUserId(ctx);
    const { name } = ctx.request.body;
    if (!name) {
      ctx.body = 'Missing name';
      return;
    }

    saveImage(id, name, ctx.files.file[0].buffer);
    ctx.redirect('/');
  }
);

router.post('/images/actions/delete/:imageName', ctx => {
  const { imageName } = ctx.params;
  const userId = getUserId(ctx);

  deleteImage(userId, imageName);
  ctx.redirect('/');
});

export default app => app.use(router.routes());