import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  // 組合出文章的 API 基礎路徑，例如：http://localhost:3000/api/posts
  private apiUrl = `${environment.apiUrl}auth`;

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
