import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VotingPosition, VotePayload } from '../../models';
import { VoteService } from '../../services/vote.service';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.css'
})
export class VotingComponent implements OnInit {
  @Input() votingData: VotingPosition[] = [];
  @Output() voteSubmitted = new EventEmitter<void>();

  currentPage = 0;
  votes: VotePayload = {};
  selectedCandidate = '';
  loading = false;
  errorMessage = '';

  get currentPosition(): VotingPosition | null {
    return this.votingData[this.currentPage] ?? null;
  }

  get isLastPage(): boolean {
    return this.currentPage === this.votingData.length - 1;
  }

  get isUnopposed(): boolean {
    return (this.currentPosition?.candidates.length ?? 0) === 1;
  }

  get progress(): number {
    return Math.round((this.currentPage / this.votingData.length) * 100);
  }

  constructor(private voteService: VoteService) {}

  ngOnInit() {
    this.selectedCandidate = '';
  }

  selectCandidate(name: string) {
    this.selectedCandidate = name;
  }

  getCandidateImageSrc(name: string): string {
    const firstName = name.split(' ')[0];
    const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    return `/images/${capitalized}.jpeg`;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/images/No.jpeg';
  }

  async next() {
    if (!this.selectedCandidate) {
      this.errorMessage = 'Please select a candidate before proceeding.';
      return;
    }
    this.errorMessage = '';
    const position = this.currentPosition!.position;
    this.votes[position] = this.selectedCandidate;

    if (this.isLastPage) {
      await this.submit();
    } else {
      this.currentPage++;
      this.selectedCandidate = '';
    }
  }

  private async submit() {
    this.loading = true;
    try {
      await this.voteService.submitVotes(this.votes);
      this.voteSubmitted.emit();
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'Vote submission failed.';
    } finally {
      this.loading = false;
    }
  }
}
