import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Authservice } from '../../services/auth';

// 標記目前是否正在刷新 Token，避免同時發送多個 refresh 請求
let isRefreshing = false;
// 用來暫存並通知其他 API「新 Token 已經拿到了」
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Authservice);
  const token = authService.getToken(); // 假設你在 AuthService 中實作了取得 localStorage token 的方法

  let authReq = req;
  if (token && !req.url.includes('/refresh')) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
// 2. 發送請求，並捕捉錯誤
  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // 如果連 refresh API 都回 401，代表 Refresh Token 也死掉了，必須登出
        if (req.url.includes('/refresh')) {
          authService.logout();
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshTokenAPI().pipe(
            switchMap((res: any) => {
              isRefreshing = false;
              refreshTokenSubject.next(res.accessToken);

              // 拿新的 Token 重送剛剛失敗的那個請求
              const newReq = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
              return next(newReq);
            }),
            catchError((err) => {
              isRefreshing = false;
              authService.logout();
              return throwError(() => err);
            })
          );
        } else {
          // 如果正在換 Token，其他 API 先排隊等候
          return refreshTokenSubject.pipe(
            filter(newToken => newToken !== null),
            take(1),
            switchMap(newToken => {
              const newReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
              return next(newReq);
            })
          );
        }
      }

      // 如果不是 401，就正常拋出錯誤
      return throwError(() => error);
    })
  );
};