import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
