import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { TokenService } from './token.service';
import { VotePayload } from '../models';

@Injectable({ providedIn: 'root' })
export class VoteService {
  constructor(
    private http: HttpClient,
    private config: ConfigService,
    private token: TokenService
  ) {}

  async submitVotes(votes: VotePayload): Promise<void> {
    const base = await this.config.getBaseUri();
    const t = this.token.getToken();
    if (!t) throw new Error('No token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${t}` });
    await firstValueFrom(
      this.http.post(`${base}/api/vote/submit`, { votes }, { headers, withCredentials: true })
    );
  }
}
