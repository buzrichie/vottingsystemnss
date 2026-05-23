import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ResultsService } from '../../services/results.service';
import { VotingPosition } from '../../models';
import { CountdownComponent } from '../countdown/countdown.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CountdownComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Output() loggedIn = new EventEmitter<VotingPosition[]>();
  @Output() showAdmin = new EventEmitter<void>();

  nssNumber = '';
  password = '';
  errorMessage = '';
  loading = false;
  electionEnded = false;

  constructor(
    private authService: AuthService,
    private resultsService: ResultsService
  ) {}

  onElectionEnded() {
    this.electionEnded = true;
  }

  async onSubmit() {
    if (!this.nssNumber.trim()) {
      this.errorMessage = 'Please enter your NSS Number.';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    try {
      const data = await this.authService.login(this.nssNumber.trim(), this.password);
      this.loggedIn.emit(data.candidates);
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async onViewResults() {
    this.loading = true;
    this.errorMessage = '';
    try {
      if (this.resultsService.hasResults()) {
        this.showAdmin.emit();
        return;
      }
      await this.authService.fetchPublicResults();
      this.showAdmin.emit();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Unable to fetch results.';
    } finally {
      this.loading = false;
    }
  }
}
