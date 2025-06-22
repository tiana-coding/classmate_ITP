import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAdmin(): boolean {
    return localStorage.getItem('userProfile')
      ? JSON.parse(localStorage.getItem('userProfile')!).isAdmin
      : false;
  }
}