import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
// 1. 引入 provideHttpClient
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// 請確保路徑正確指向你的 auth-interceptor.ts
import { authInterceptor } from './core/interceptors/auth-interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload', // 允許相同路徑跳轉
      }),
    ),
    provideHttpClient(),
  ],
};
