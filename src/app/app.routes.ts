import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { PostDetail } from './pages/post-detail/post-detail';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// 登入後的功能頁面
import { Dashboard } from './pages/dashboard/dashboard';
import { Editor } from './pages/dashboard/editor/editor';

// 引入 authGuard
import { authGuard } from './core/guards/auth-guard';
export const routes: Routes = [
  { path: '', component: Home, runGuardsAndResolvers: 'always' }, // 關鍵設定：即使路徑相同，也總是執行 Guard 和 Resolver
  { path: 'post/:id', component: PostDetail },
  { path: 'nlog', component: Login },
  { path: 'nreg', component: Register },
  // 後台路由，加上 canActivate 保護
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  // 新增文章
  { path: 'dashboard/editor', component: Editor, canActivate: [authGuard] },
  // 編輯文章 (帶入 id 參數)
  { path: 'dashboard/editor/:id', component: Editor, canActivate: [authGuard] },


  // 找不到路由時回到首頁，要放最後，不然其他頁面沒辦法看
  { path: '**', redirectTo: '' },
];
