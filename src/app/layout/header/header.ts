import { Component, inject } from '@angular/core';
import { Route, RouterLink, RouterLinkActive } from '@angular/router';
import { Authservice } from '../../services/auth';
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  authService = inject(Authservice);

  logout() {
    this.authService.logout();
    // 登出後也可以選擇導向首頁 this.router.navigate(['/']);
  }
}
