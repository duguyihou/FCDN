export async function ensureLoggedIn(ctx, next) {
    await next();
  }
  
  export function getUserId(ctx) {
    return '123321';
  }