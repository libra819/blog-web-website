import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
// 這裡引入了 Header、Sidebar 和 Footer 組件
import { Header } from './layout/header/header';
import { Sidebar } from './layout/sidebar/sidebar';
import { Footer } from './layout/footer/footer';  
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('blog-web-website');
  // 控制是否隱藏 Sidebar 和 Footer 的變數
  hideLayout = false; 
  
  // 使用 Angular 推薦的 inject() 方式注入服務
  private router = inject(Router);

  constructor() {
    // 監聽路由變化
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 如果導航後的網址包含 '/dashboard'，則設定為 true
      this.hideLayout = event.urlAfterRedirects.includes('/dashboard');
    });
  }
}
