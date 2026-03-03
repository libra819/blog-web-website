import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Authservice } from '../../services/auth';
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  authService = inject(Authservice);
  private router = inject(Router);

  logout() {
    this.authService.logout();
     this.router.navigate(['/']);
    // 登出後也可以選擇導向首頁 this.router.navigate(['/']);
  }
}
