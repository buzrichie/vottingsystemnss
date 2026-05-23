import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { VotingComponent } from './components/voting/voting.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { VotingPosition } from './models';

type View = 'login' | 'voting' | 'thank-you' | 'admin';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, VotingComponent, ThankYouComponent, AdminPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  view: View = 'login';
  votingData: VotingPosition[] = [];

  onLoggedIn(candidates: VotingPosition[]) {
    this.votingData = candidates;
    this.view = 'voting';
  }

  onVoteSubmitted() {
    this.view = 'thank-you';
  }

  onShowAdmin() {
    this.view = 'admin';
  }

  onAdminClosed() {
    this.view = 'login';
  }
}
