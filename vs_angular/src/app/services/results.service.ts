import { Injectable } from '@angular/core';
import { VoteStats, PositionResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private results: Record<string, PositionResult> | null = null;
  private stats: VoteStats | null = null;

  setResults(data: Record<string, PositionResult>) { this.results = data; }
  getResults(): Record<string, PositionResult> | null { return this.results; }

  setStats(data: VoteStats) { this.stats = data; }
  getStats(): VoteStats | null { return this.stats; }

  hasResults(): boolean { return this.results !== null; }

  clear() {
    this.results = null;
    this.stats = null;
  }
}
