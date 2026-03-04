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
  tags: string; // 資料庫的 varchar，例如 "Angular,Express,JWT"
  created_at: string; // 後端回傳的 ISO 8601 時間字串
  updated_at: string;
}

// 定義後端回傳的分頁資料結構
export interface PaginatedPosts {
  data: Post[];
  total: number;
  page: number;
  totalPages: number;
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
  getPosts(query: string, page: number = 1, limit: number = 10): Observable<PaginatedPosts> {
    console.log('呼叫 PostService.getPosts()，API URL:', this.apiUrl);
    if (query && query.trim() !== '') {
      if (query.includes('category')) {
        return this.http.get<PaginatedPosts>(
          this.apiUrl + (query ? `?category=${encodeURIComponent(query.split('=')[1])}&page=${page}&limit=${limit}` : ''),
        );
      } else {
        return this.http.get<PaginatedPosts>(
          this.apiUrl + (query ? `?tags=${encodeURIComponent(query.split('=')[1])}&page=${page}&limit=${limit}` : ''),
        );
      }
    } else {
      return this.http.get<PaginatedPosts>(this.apiUrl + `?page=${page}&limit=${limit}`);
    }
  }

  // 取得單篇文章 (支援傳入 id 或 uuid)
  getPostById(identifier: string | number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${identifier}`);
  }

  // 新增文章 (發送 POST 請求，JWT Interceptor 會自動帶 Token)
  createPost(post: CreatePostDTO): Observable<Post> {
    return this.http.post<Post>(this.apiUrl + '/addpost', post);
  }

  // 更新文章
  updatePost(id: number, post: Partial<CreatePostDTO>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  // 刪除文章
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // 依照文章的標籤category來看所有類別的文章數量
  getCategoryCounts(): Observable<{ category: string; count: number }[]> {
    return this.http.get<{ category: string; count: number }[]>(`${this.apiUrl}/getCategory`);
  }

  // 取得所有分類
  getCategories(): Observable<string[]> {
    console.log('呼叫 PostService.getCategories()，API URL:', `${this.apiUrl}/categories`);
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }

  // 新增分類
  addCategory(categoryName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/categories`, { category: categoryName });
  }
}
