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

// 若有新增文章的需求，通常不包含 id, uuid, 時間等由資料庫產生的欄位
export type CreatePostDTO = Omit<Post, 'id' | 'uuid' | 'created_at' | 'updated_at' | 'author_name'>;

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  // 組合出文章的 API 基礎路徑，例如：http://localhost:3000/api/posts
  private apiUrl = `${environment.apiUrl}post`;

  // 取得所有文章列表
  getPosts(): Observable<Post[]> {
    console.log('呼叫 PostService.getPosts()，API URL:', this.apiUrl);
    return this.http.get<Post[]>(this.apiUrl);
  }

  // 取得單篇文章 (支援傳入 id 或 uuid)
  getPostById(identifier: string | number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${identifier}`);
  }

  // 新增文章 (發送 POST 請求，JWT Interceptor 會自動帶 Token)
  createPost(post: CreatePostDTO): Observable<Post> {
    return this.http.post<Post>(this.apiUrl+"/addpost", post);
  }

  // 更新文章
  updatePost(id: number, post: Partial<CreatePostDTO>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  // 刪除文章
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
