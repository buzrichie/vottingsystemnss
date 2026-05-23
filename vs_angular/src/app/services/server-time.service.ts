import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { ServerTime } from '../models';

@Injectable({ providedIn: 'root' })
export class ServerTimeService {
  constructor(private http: HttpClient, private config: ConfigService) {}

  async fetch(): Promise<ServerTime> {
    const base = await this.config.getBaseUri();
    return firstValueFrom(this.http.get<ServerTime>(`${base}/api/server-time`));
  }
}
