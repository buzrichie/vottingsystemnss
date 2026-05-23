import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ResultsService } from '../../services/results.service';
import { TokenService } from '../../services/token.service';
import { PositionResult, VoteStats } from '../../models';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  results: Record<string, PositionResult> = {};
  stats: VoteStats = { totalVoters: 0, totalVotesCast: 0 };
  positions: string[] = [];
  loading = false;
  errorMessage = '';
  needsPassword = false;
  adminPassword = '';

  constructor(
    private authService: AuthService,
    private resultsService: ResultsService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    if (this.resultsService.hasResults()) {
      this.loadFromCache();
    } else if (!this.tokenService.getAdminToken()) {
      this.needsPassword = true;
    }
  }

  private loadFromCache() {
    this.results = this.resultsService.getResults() ?? {};
    this.stats = this.resultsService.getStats() ?? { totalVoters: 0, totalVotesCast: 0 };
    this.positions = Object.keys(this.results);
    this.needsPassword = false;
  }

  async onAdminLogin() {
    if (!this.adminPassword.trim()) {
      this.errorMessage = 'Password is required.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      await this.authService.adminLogin(this.adminPassword.trim());
      this.loadFromCache();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Login failed.';
    } finally {
      this.loading = false;
    }
  }

  getSortedCandidates(position: PositionResult) {
    return [...position.candidates].sort((a, b) => b.votes - a.votes);
  }

  capitalizeWords(str: string): string {
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getCandidateImageSrc(name: string): string {
    const firstName = name.split(' ')[0];
    const cap = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return `/images/${cap}.jpeg`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/images/No.jpeg';
  }

  close() {
    this.closed.emit();
  }
}
