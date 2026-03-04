import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Post, PostService } from '../../services/post';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private postService = inject(PostService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute); // 用來讀取網址參數
  private router = inject(Router);
  // constructor(private route: ActivatedRoute) {}
  // 將原本的變數改為 Signal
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);

  // 新增：分頁狀態管理
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const page = Number(params['page']) || 1;
      const limit = Number(params['limit']) || 10;
      this.currentPage.set(page);
      const tag = params["tags"] || '';
      const category = params["category"] || '';
      var query = tag ? `tags=${tag}` : category ? `category=${category}` : '';
      // query += query == "" ? `&page=${page}` : `?page=${page}`;
      this.searchTag(query, page, limit);
    });
  }

  searchTag(query: string, page: number = 1, limit: number = 10) {
    this.postService.getPosts(query, page, limit).subscribe({
      next: (data) => {
        if (data.data.length === 0) {
          this.snackBar.open('沒有找到相關文章', '關閉', { duration: 3000 });
        }
        this.posts.set(data.data);
        this.totalPages.set(data.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('無法取得文章列表，請稍後再試', '關閉', { duration: 3000 });
        console.error('取得文章列表失敗', err);
        this.isLoading.set(false);
      },
    });
  }
// 切換頁面：不直接呼叫 API，而是改變網址列，讓上面的 subscribe 觸發更新
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.router.navigate(['/'], { queryParams: { page: page } });
    }
  }
  // 準備用來渲染的假資料
  /*posts = [
    { 
      id: 1, 
      title: 'Angular 20 與 Express 整合 JWT 登入實戰與 Token 攔截器', 
      summary: '前後端分離架構下，記錄如何實作 Node.js Express 後端簽發 JWT，並在 Angular 前端透過 Interceptor 自動攜帶 Token 的完整流程...', 
      date: new Date('2026-02-10 12:00:00'), 
      category: 'Web Development' 
    },
    { 
      id: 2, 
      title: '在 Ubuntu 24.04 使用 Postfix 建立 Mail Server 的踩坑紀錄', 
      summary: '最近在設定 Mail Server，遇到發送至 Gmail 時因為 SPF/DKIM 驗證失敗的問題。這篇記錄了如何配置 OpenDKIM 與 TLS，以及相關除錯方式。', 
      date: new Date('2026-01-16 10:30:00'), 
      category: 'Linux & Server' 
    },
    { 
      id: 3, 
      title: 'C# 非同步程式設計 (async/await) 的底層原理解析', 
      summary: '深入探討 .NET 中的 Task 狀態機，以及在應用程式中如何正確使用 async/await 以避免 Deadlock 的產生。', 
      date: new Date('2025-10-05 15:45:00'), 
      category: 'C#' 
    }
  ];*/
}
