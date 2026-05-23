import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private token = '';
  private adminToken = '';

  setToken(t: string) { this.token = t; }
  getToken(): string | null { return this.token || null; }

  setAdminToken(t: string) { this.adminToken = t; }
  getAdminToken(): string | null { return this.adminToken || null; }

  clearAll() {
    this.token = '';
    this.adminToken = '';
  }
}
