import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService, Post } from '../../../services/post';
import { Authservice } from '../../../services/auth';
import { CreatePostDTO } from '../../../services/post';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
// 引入 Editor.js 與相關套件
import EditorJS from '@editorjs/editorjs';
// @ts-ignore
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import CodeTool from '@editorjs/code';
// 引入剛剛安裝的圖片套件
// @ts-ignore
import ImageTool from '@editorjs/image';

import { HttpClient } from '@angular/common/http'; // 1. 引入 HttpClient
import { firstValueFrom } from 'rxjs'; // 2. 引入 firstValueFrom

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
  private authService = inject(Authservice);
  private http = inject(HttpClient);
  editor!: EditorJS; // 宣告 Editor.js 實體

  // 狀態管理
  postId = signal<number | null>(null); // 用來判斷是新增還是編輯
  isSaving = signal<boolean>(false);
  isLoadingData = signal<boolean>(false);

  // 建立表單
  // 注意：我們把 content 從 FormBuilder 中移除了，因為 Editor.js 不受 Angular 表單直接控管
  editorForm = this.fb.group({
    title: ['', [Validators.required]],
    category: ['', [Validators.required]],
    tags: [''],
    summary: ['', [Validators.required, Validators.maxLength(500)]],
  });

  // 新增一個 Signal 用來存放分類列表
  categoryList = signal<string[]>([]);

  ngOnInit(): void {
    // 載入分類列表
    this.loadCategories();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.postId.set(Number(id));
        this.loadPostData(Number(id));
      } else {
        // 新增模式：延遲初始化，確保畫面已經渲染
        setTimeout(() => {
          this.initEditor();
        }, 0);
      }
    });
  }

  // 取得資料庫中的分類
  loadCategories() {
    this.postService.getCategories().subscribe({
      next: (categories) => this.categoryList.set(categories),
      error: (err) => console.error('無法載入分類清單', err),
    });
  }

  // 初始化 Editor.js
  initEditor(existingData?: any) {
    const uploadEndpoint = `${environment.apiUrl}upload/image`;
    this.editor = new EditorJS({
      holder: 'editorjs', // 對應 HTML 中的 id
      data: existingData, // 如果是編輯模式，這裡會傳入舊的 JSON 資料
      placeholder: '開始撰寫你的技術文章...',
      tools: {
        header: Header,
        list: List,
        code: CodeTool,
        image: {
          class: ImageTool,
          config: {
            // 移除原本的 endpoints 和 additionalRequestHeaders
            // 改用自訂的 uploader
            uploader: {
              uploadByFile: async (file: File) => {
                // 1. 將圖片包裝成 FormData，欄位名稱必須與後端 multer.single('image') 一致
                const formData = new FormData();
                formData.append('image', file);

                try {
                  // 2. 使用 Angular 的 HttpClient 發送請求！
                  // 這樣請求就會「乖乖排隊」經過我們的 authInterceptor，
                  // 沒 Token 會自動加，過期了也會自動換發後重送！
                  const response = await firstValueFrom(
                    this.http.post<any>(uploadEndpoint, formData),
                  );

                  // 3. 回傳 Editor.js 規定的 JSON 格式
                  return response;
                } catch (error) {
                  console.error('圖片上傳失敗', error);
                  return { success: 0, message: '上傳失敗，請檢查權限或網路狀態' };
                }
              },
            },
          },
        },
      },
    });
  }

  loadPostData(id: number) {
    this.isLoadingData.set(true);
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.editorForm.patchValue({
          title: post.title,
          category: post.category,
          tags: post.tags,
          summary: post.summary,
        });

        let parsedContent = {};
        try {
          parsedContent = post.content ? JSON.parse(post.content) : {};
        } catch (e) {
          console.error('解析文章內容失敗', e);
        }

        // 把 isLoadingData 設為 false，觸發 Angular 更新畫面 (顯示表單)
        this.isLoadingData.set(false);

        // 使用 setTimeout 確保 HTML 的 div#editorjs 已經出現在畫面上，才讓 Editor.js 綁定
        setTimeout(() => {
          this.initEditor(parsedContent);
        }, 0);
      },
      error: (err) => {
        console.error('載入文章失敗', err);
        this.router.navigate(['/dashboard']);
      },
    });
  }

  async onSave() {
    if (this.editorForm.invalid) {
      this.editorForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    try {
      // 1. 從 Editor.js 取得最新的 JSON 內容
      const editorData = await this.editor.save();

      // 取得表單目前的值
      const formValue = this.editorForm.value;

      // 2. 組合要送給後端的資料，並確保沒有 null (使用 ?? 運算子)
      const postData: Partial<CreatePostDTO> = {
        title: formValue.title ?? '',
        category: formValue.category ?? '',
        tags: formValue.tags ?? '',
        summary: formValue.summary ?? '',
        content: JSON.stringify(editorData), // 將 Editor JSON 轉為字串
      };

      // 【核心邏輯】檢查並新增未知的分類
      const inputCategory = formValue.category?.trim();
      if (inputCategory && !this.categoryList().includes(inputCategory)) {
        try {
          // 如果分類不在清單內，先呼叫 API 將其寫入 postsettings
          await firstValueFrom(this.postService.addCategory(inputCategory));
          // 更新本地 Signal，避免重複發送
          this.categoryList.update((list) => [...list, inputCategory]);
        } catch (catErr) {
          console.error('新增分類至資料庫失敗', catErr);
          // 這裡可以選擇不中斷流程，繼續儲存文章
        }
      }

      const currentId = this.postId();

      // 3. 發送 API
      if (currentId) {
        this.postService.updatePost(currentId, postData).subscribe({
          next: () => this.handleSuccess('更新成功'),
          error: (err) => this.handleError(err),
        });
      } else {
        this.postService.createPost(postData as CreatePostDTO).subscribe({
          next: () => this.handleSuccess('發布成功'),
          error: (err) => this.handleError(err),
        });
      }
    } catch (error) {
      console.error('取得 Editor.js 資料失敗: ', error);
      this.isSaving.set(false);
    }
  }

  private handleSuccess(msg: string) {
    this.isSaving.set(false);
    this.snackBar.open(msg, '關閉', { duration: 3000 });
    this.router.navigate(['/dashboard']);
  }

  private handleError(err: any) {
    if (err.status === 401) {
      this.authService.logout();
      this.router.navigate(['/']);
      return;
    } else if (err.status === 400) {
      this.snackBar.open(err.error?.message || '請檢查輸入內容是否正確', '關閉', {
        duration: 3000,
      });
      this.isSaving.set(false);
      return;
    } else if (err.status === 403) {
      this.snackBar.open('您沒有權限執行此操作', '關閉', { duration: 3000 });
      this.isSaving.set(false);
      this.authService.logout();
      this.router.navigate(['/nlog']);
      return;
    } else {
      this.isSaving.set(false);
      console.error('儲存失敗', err);
    }
    // this.snackBar.open('儲存失敗，請檢查輸入或稍後再試', '關閉', { duration: 3000 });
  }
}
