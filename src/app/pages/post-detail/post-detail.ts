import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Post, PostService } from '../../services/post';

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

  // 存放文章資料的變數
  post = signal<Post>({
    id: 0,
    uuid: '',
    category: '',
    author_id: '',
    author_name: '', // 假設後端會 JOIN members 表並回傳作者名稱
    title: '',
    summary: '',
    content: '',
    tags: '', // 資料庫的 varchar，例如 "Angular,Express,JWT"
    created_at: '', // 後端回傳的 ISO 8601 時間字串
    updated_at: '',
  });

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
    /*
    // 這裡放一筆假資料供切版使用，之後會換成呼叫 post.service.ts
    this.post = {
      id: id,
      title: 'Angular 20 與 Express 整合 JWT 登入實戰',
      date: new Date('2026-02-10'),
      category: 'Web Development',
      author: '陳秉宏',
      content: `
        <p>在現代的前後端分離架構中，使用 JSON Web Token (JWT) 來處理使用者身分驗證是非常普遍的做法。這篇文章將記錄如何實作 Node.js Express 後端簽發 JWT，並在 Angular 前端進行整合。</p>
        
        <h3>1. 後端 Express 簽發 Token</h3>
        <p>當使用者登入成功後，後端會產生一組 Token 並回傳給前端。我們通常會把 User ID 放在 Payload 裡面：</p>
        <pre><code>const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });</code></pre>
        
        <h3>2. 前端 Angular 攔截器 (Interceptor)</h3>
        <p>前端拿到 Token 後，可以存在 <code>localStorage</code>，接著透過 Angular 的 Interceptor 在每次發送 HTTP 請求時，自動將 Token 塞入 Header 中。</p>
        
        <blockquote>
          <strong>注意：</strong>在處理 Token 時，務必注意 XSS 攻擊的風險，並且評估是否需要實作 Refresh Token 機制以提升安全性。
        </blockquote>
        
        <p>接下來我們還會討論如何實作路由守衛 (Route Guard) 來保護特定的頁面...</p>
      `,
      tags: 'Angular,Express,JWT'.split(',') // 將字串轉成陣列
    };*/
    this.postService.getPostById(id).subscribe({
      next: (data) => {
        this.post.set(data);
      },
      error: (err) => {
        console.error('取得文章失敗', err);
        // 如果文章不存在或發生錯誤，可以導回首頁或顯示錯誤訊息
        this.router.navigate(['/']);
      },
    });
  }

  searchByTag(tag: string) {
    // 搜尋tag，回到首頁並顯示搜尋tag的結果
    console.log('搜尋:', tag);
    // 這裡可以使用 Angular 的 Router 來導航回首頁，並帶上搜尋參數
    // 例如：this.router.navigate(['/'], { queryParams: { q: tag } });
    this.router.navigate(['/'], { queryParams: { tags: tag } });
  }
}
