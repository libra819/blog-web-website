import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Post, PostService } from '../../services/post';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private postService = inject(PostService);
  constructor(private route: ActivatedRoute) {}
  // 將原本的變數改為 Signal
  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    // const queryParams = new URLSearchParams(window.location.search);
    // const tag = queryParams.get('tags') || '';
    // const category = queryParams.get('category') || '';
    // const query = tag ? `tags=${tag}` : category ? `category=${category}` : '';
    // console.error('取得文章列表', query);
    // this.searchTag(query);

    this.route.queryParams.subscribe((params) => {
      const tag = params["tags"] || '';
      const category = params["category"] || '';
      const query = tag ? `tags=${tag}` : category ? `category=${category}` : '';
      console.error('取得文章列表', query);
      this.searchTag(query);
      // const category = params['category'];
      // // if (category) {
      // //   this.searchTag(category ? `category=${category}` : '');
      // // }
    });
  }

  searchTag(query: string) {
    this.postService.getPosts(query).subscribe({
      next: (data) => {
        this.posts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('取得文章列表失敗', err);
        this.isLoading.set(false);
      },
    });
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
