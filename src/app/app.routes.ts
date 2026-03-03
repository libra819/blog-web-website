import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { PostDetail } from './pages/post-detail/post-detail';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
export const routes: Routes = [
  
  { path: '', component: Home, runGuardsAndResolvers: 'always' },// 關鍵設定：即使路徑相同，也總是執行 Guard 和 Resolver
  { path: 'post/:id', component: PostDetail },
  { path: 'nlog', component: Login },
  { path: 'nreg', component: Register },
  { path: '**', redirectTo: '' }, // 找不到路由時回到首頁
];
