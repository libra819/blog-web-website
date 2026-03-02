import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostService } from '../../services/post';

export interface CategoryCount {
  category: string;
  count: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  private router = inject(Router);
  private postService = inject(PostService);
  categories = signal<CategoryCount[]>([]);
  ngOnInit(): void {
    // 這裡可以放一些初始化的邏輯，例如載入熱門文章、分類列表等
    this.postService.getCategoryCounts().subscribe({
      next: (data) => {
        this.categories.set(data.sort((a, b) => b.count - a.count)); // 按照文章數量排序
        console.log('取得分類列表成功', data);
      },
    });
  }

  searchByCategory(category: string) {
    this.router.navigate(['/'], {
      queryParams: { category: category },
      // 強制讓 Router 認為這是一次新的導航
      onSameUrlNavigation: 'reload',
    });
  }
}
