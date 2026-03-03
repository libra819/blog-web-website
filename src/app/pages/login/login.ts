import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Authservice } from '../../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(Authservice);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // 建立登入表單
  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.value as any;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        // 登入成功，導向首頁
        this.snackBar.open('登入成功！', '關閉', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        // 根據 Express 後端的回傳自訂錯誤訊息
        this.errorMessage.set(err.error?.message || '登入失敗，請檢查帳號或密碼。');
        console.error('登入錯誤', err);
      }
    });
  }
}
