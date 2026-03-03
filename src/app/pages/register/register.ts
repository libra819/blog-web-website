import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authservice, RegisterDTO } from '../../services/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(Authservice);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
    // 狀態管理 (使用 Signals)
  isLoading = signal(false);
  errorMessage = signal<string | null>(null)

  // 建立響應式表單
  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator }); // 加入自訂的密碼比對驗證器

  // 自訂驗證器：檢查密碼與確認密碼是否一致
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // 提交表單
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // 觸發所有紅字錯誤提示
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // 排除 confirmPassword，只送出 API 需要的資料
    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData as any).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        alert('註冊成功！請登入。');
        this.router.navigate(['/nlog']); // 註冊成功後導向登入頁
      },
      error: (err) => {
        this.isLoading.set(false);
        // 假設後端會回傳 { message: '信箱已被使用' } 這樣的格式
        this.errorMessage.set(err.error?.message || '註冊失敗，請稍後再試。');
        console.error('註冊錯誤', err);
      }
    });
  }
}
