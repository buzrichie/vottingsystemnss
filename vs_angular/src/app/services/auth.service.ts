import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { TokenService } from './token.service';
import { ResultsService } from './results.service';
import { LoginResponse, AdminLoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private token: TokenService,
    private results: ResultsService
  ) {}

  async login(nssNumber: string, password: string): Promise<LoginResponse> {
    const base = await this.config.getBaseUri();
    const res = await firstValueFrom(
      this.http.post<LoginResponse>(`${base}/api/auth/login`, { nssNumber, password }, { withCredentials: true })
    );
    this.token.setToken(res.csrfToken);
    return res;
  }

  async adminLogin(password: string): Promise<AdminLoginResponse> {
    const base = await this.config.getBaseUri();
    const res = await firstValueFrom(
      this.http.post<AdminLoginResponse>(`${base}/api/auth/admin/login`, { password }, { withCredentials: true })
    );
    this.token.setAdminToken(res.csrfToken);
    this.results.setResults(res.results.results);
    this.results.setStats(res.results.stats);
    return res;
  }

  async fetchPublicResults(): Promise<void> {
    const base = await this.config.getBaseUri();
    const res = await firstValueFrom(
      this.http.get<{ results: { results: Record<string, any>; stats: any } }>(
        `${base}/api/admin/public-results`,
        { withCredentials: true }
      )
    );
    this.results.setResults(res.results.results);
    this.results.setStats(res.results.stats);
  }
}
