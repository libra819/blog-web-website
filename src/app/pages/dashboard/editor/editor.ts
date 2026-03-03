import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService, Post } from '../../../services/post';
import { CreatePostDTO } from '../../../services/post';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './editor.html',
  styleUrl: './editor.scss',
})
export class Editor implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // 狀態管理
  postId = signal<number | null>(null); // 用來判斷是新增還是編輯
  isSaving = signal<boolean>(false);
  isLoadingData = signal<boolean>(false);

  // 建立表單
  editorForm = this.fb.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    tags: [''], // 例如："Angular,Node.js,Web"
    summary: ['', [Validators.required, Validators.maxLength(500)]],
    content: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // 檢查網址列是否有 id 參數
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.postId.set(Number(id));
        this.loadPostData(Number(id));
      }
    });
  }

  // 編輯模式：載入既有文章資料並填入表單
  loadPostData(id: number) {
    this.isLoadingData.set(true);
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        // 使用 patchValue 將資料填入對應的表單欄位
        this.editorForm.patchValue({
          title: post.title,
          category: post.category,
          tags: post.tags,
          summary: post.summary,
          content: post.content
        });
        this.isLoadingData.set(false);
      },
      error: (err) => {
        console.error('載入文章失敗', err);
        alert('無法載入文章資料');
        this.router.navigate(['/dashboard']);
      }
    });
  }


  // 儲存表單
  onSave() {
    if (this.editorForm.invalid) {
      this.editorForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    // 這裡我們假設後端的 token 已經帶有 author_id，所以前端不需要傳送 author_id
    const postData = this.editorForm.value as Partial<CreatePostDTO>;

    const currentId = this.postId();

    if (currentId) {
      // 編輯模式 (PUT)
      this.postService.updatePost(currentId, postData).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('文章更新成功！');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => this.handleSaveError(err)
      });
    } else {
      // 新增模式 (POST)
      this.postService.createPost(postData as CreatePostDTO).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('文章新增成功！');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => this.handleSaveError(err)
      });
    }
  }

  private handleSaveError(err: any) {
    this.isSaving.set(false);
    console.error('儲存失敗', err);
    this.snackBar.open('儲存失敗，請稍後再試', '關閉', { duration: 3000 });
  }
}
