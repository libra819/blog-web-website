import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Authservice } from '../../services/auth';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Authservice);
  const router = inject(Router);
  console.log('AuthGuard invoked for route:', state.url);
  // 如果已登入，允許進入
  if (authService.isLoggedIn()) {
    return true;
  }

  // 否則，把使用者踢回登入頁面
  return router.createUrlTree(['/']);
};
