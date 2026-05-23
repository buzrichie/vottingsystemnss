import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private baseUri = '';

  constructor(private http: HttpClient) {}

  async getBaseUri(): Promise<string> {
    if (this.baseUri) return this.baseUri;
    try {
      const data = await firstValueFrom(this.http.get<{ baseUri: string }>('/config'));
      this.baseUri = data.baseUri;
    } catch {
      this.baseUri = 'http://localhost:5000';
    }
    return this.baseUri;
  }
}
