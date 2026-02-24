import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// 根據你的 MariaDB Schema 定義對應的 TypeScript Interface
export interface Post {
  id: number;
  uuid: string;
  category: string;
  author_id: string;
  author_name?: string; // 假設後端會 JOIN members 表並回傳作者名稱
  title: string;
  summary: string;
  content: string;
  tags: string;         // 資料庫的 varchar，例如 "Angular,Express,JWT"
  created_at: string;   // 後端回傳的 ISO 8601 時間字串
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class Post {
  private http = inject(HttpClient);
  // 組合出文章的 API 基礎路徑，例如：http://localhost:3000/api/posts
  private apiUrl = `${environment.apiUrl}/post`;

  /**
   * 取得所有文章列表 (供首頁 HomeComponent 使用)
   */
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }

  /**
   * 根據 ID 取得單篇文章 (供文章內頁 PostDetailComponent 使用)
   * 你的資料表有 id (自動遞增) 和 uuid，這裡保留彈性，支援傳入 string 或 number
   */
  getPostById(id: number | string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }
}
