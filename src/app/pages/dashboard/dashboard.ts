import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  posts = signal<Post[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.snackBar.open('歡迎來到後台管理頁面！', '關閉', { duration: 3000 });
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts("").subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.snackBar.open('載入文章失敗', '關閉', { duration: 3000 });
        this.isLoading.set(false);
        console.error('載入文章失敗:', err);
      }
    });
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
