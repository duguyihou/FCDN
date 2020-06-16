import express from 'express';

export async function ensureLoggedIn(ctx, next) {
    await next();
  }
  
export function getUserId(ctx) {
  return '123321';
}

const PORT = process.env.PORT || 3000;
const app = express();
app.get('/', (req, res) => res.send('Hello World!'));
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));