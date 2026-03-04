import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // 新增 Sanitizer
import { MatSnackBar } from '@angular/material/snack-bar';
import { Post, PostService } from '../../services/post';
import edjsHTML from 'editorjs-html'; // 新增 Editor.js 解析器
// 1. 引入 Highlight.js 核心
import hljs from 'highlight.js';
@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.scss',
})
export class PostDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer); // 注入 Sanitizer
  // 存放文章資料的變數
  post = signal<Post>({
    id: 0,
    uuid: '',
    category: '',
    author_id: '',
    author_name: '',
    title: '',
    summary: '',
    content: '',
    tags: '',
    created_at: '',
    updated_at: '',
  });

  // 新增：存放轉譯後的 Editor.js HTML
  parsedHtml = signal<SafeHtml>('');

  ngOnInit(): void {
    // 取得路由的參數，這裡假設路由定義為 /post/:id
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadPost(id);
      }
    });
  }

  // 模擬從 API 讀取文章
  loadPost(id: string | number) {
    this.postService.getPostById(id).subscribe({
      next: (data) => {
        this.post.set(data);
        // 取得資料後，立刻解析 Editor.js 的 JSON 內容
        this.parseEditorJsContent(data.content);
      },
      error: (err) => {
        console.error('取得文章失敗', err);
        this.snackBar.open('無法取得文章內容，請稍後再試', '關閉', { duration: 3000 });
        this.router.navigate(['/']);
      },
    });
  }

  // 新增：處理 JSON 轉 HTML 的邏輯
  parseEditorJsContent(rawContent: string) {
    if (!rawContent) return;

    try {
      const contentObj = JSON.parse(rawContent);
      const edjsParser = edjsHTML();
      const htmlArray = edjsParser.parse(contentObj);
      const rawHtml = htmlArray;

      // 使用 bypassSecurityTrustHtml 讓 Angular 允許渲染我們產生的標籤
      this.parsedHtml.set(this.sanitizer.bypassSecurityTrustHtml(rawHtml));

      // 2. 關鍵點：使用 setTimeout 讓 Angular 有時間把 [innerHTML] 塞進畫面
      setTimeout(() => {
        // 抓取畫面上所有的 <pre><code> 區塊 (這正是 editorjs-html 預設輸出的格式)
        document.querySelectorAll('pre code').forEach((block) => {
          // 呼叫 Highlight.js 對每個區塊進行上色與自動語言偵測
          hljs.highlightElement(block as HTMLElement);
        });
      }, 0);
    } catch (e) {
      console.error('解析 Editor.js 內容失敗，直接渲染原始內容', e);
      // 避免舊資料 (純文字或舊 HTML) 壞掉的防呆機制
      this.parsedHtml.set(this.sanitizer.bypassSecurityTrustHtml(rawContent));

      // 容錯機制：即使是舊的純 HTML 資料，也嘗試對其進行高亮上色
      setTimeout(() => {
        document.querySelectorAll('pre code').forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 0);
    }
  }

  searchByTag(tag: string) {
    // 搜尋tag，回到首頁並顯示搜尋tag的結果
    console.log('搜尋:', tag);
    // 這裡可以使用 Angular 的 Router 來導航回首頁，並帶上搜尋參數
    // 例如：this.router.navigate(['/'], { queryParams: { q: tag } });
    this.router.navigate(['/'], { queryParams: { tags: tag } });
  }
}
