import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostService, Post } from '../../services/post';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private postService = inject(PostService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);

  // 新增分頁狀態
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  ngOnInit(): void {
    this.snackBar.open('歡迎來到後台管理頁面！', "", { duration: 1000 });
    // 監聽網址列的分頁參數
    this.route.queryParams.subscribe(params => {
      const page = Number(params['page']) || 1;
      this.currentPage.set(page);
      this.loadPosts(page);
    });
  }

  loadPosts(page: number = 1) {
    this.postService.getPosts("", page, 10).subscribe({
      next: (posts) => {
        this.posts.set(posts.data);
        this.totalPages.set(posts.totalPages);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('載入文章失敗', '關閉', { duration: 3000 });
        this.isLoading.set(false);
        console.error('載入文章失敗:', err);
      }
    });
  }

  // 切換分頁
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      // 注意：這裡的路徑要改為 /dashboard
      this.router.navigate(['/dashboard'], { queryParams: { page: page } });
    }
  }

  // 刪除文章
  deletePost(id: number, title: string) {
    if (confirm(`確定要刪除文章「${title}」嗎？這個動作無法復原。`)) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          // 刪除成功後，更新前端的 Signal 陣列，把該篇文章過濾掉
          this.posts.update(currentPosts => currentPosts.filter(p => p.id !== id));
          alert('文章已刪除');
        },
        error: (err) => {
          console.error('刪除失敗', err);
          alert('刪除失敗，請檢查權限或伺服器狀態');
        }
      });
    }
  }
}
