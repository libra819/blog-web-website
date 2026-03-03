import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  private http = inject(HttpClient);
  // 組合出文章的 API 基礎路徑，例如：http://localhost:3000/api/posts
  private apiUrl = `${environment.apiUrl}auth`;
  private tokenKey = 'blog_jwt_token';

  // 利用 Signal 管理全域登入狀態，初始值由 localStorage 決定
  isLoggedIn = signal<boolean>(this.hasToken());

  // 將 Token 存入 localStorage
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // 取得 Token (你之前的 auth.interceptor.ts 會呼叫這個方法)
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 檢查是否有 Token
  hasToken(): boolean {
    return !!this.getToken();
  }

  // 註冊 API
  register(data: RegisterDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // 登入 API
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      // tap 可以在不改變 Observable 回傳值的情況下，執行一些副作用 (Side Effect)
      tap((res) => {
        // 假設你的 Express 後端回傳格式為 { token: 'ey...' }
        if (res.token) {
          this.setToken(res.token);
          this.isLoggedIn.set(true); // 更新登入狀態
        }
      }),
    );
  }
  // 登出邏輯
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedIn.set(false); // 更新登入狀態
  }
}
