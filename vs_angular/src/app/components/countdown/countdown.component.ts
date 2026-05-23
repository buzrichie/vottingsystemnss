import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServerTimeService } from '../../services/server-time.service';

interface CountdownDisplay {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  label: string;
}

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.css'
})
export class CountdownComponent implements OnInit, OnDestroy {
  @Output() electionEnded = new EventEmitter<void>();

  display: CountdownDisplay = { days: '00', hours: '00', minutes: '00', seconds: '00', label: 'Loading...' };

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private serverTime!: Date;
  private votingStartTime!: Date;
  private votingEndTime!: Date;
  private clientLoadTime = Date.now();

  constructor(private serverTimeService: ServerTimeService) {}

  async ngOnInit() {
    try {
      const data = await this.serverTimeService.fetch();
      this.serverTime = new Date(data.serverTime);
      this.votingStartTime = new Date(data.votingStartTime);
      this.votingEndTime = new Date(data.votingEndTime);
      this.startCountdown();
    } catch {
      this.display.label = 'Unable to load election time.';
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private startCountdown() {
    this.intervalId = setInterval(() => {
      const now = new Date(this.serverTime.getTime() + (Date.now() - this.clientLoadTime));

      if (now < this.votingStartTime) {
        this.updateDisplay(this.votingStartTime.getTime() - now.getTime(), 'Election starts in:');
      } else if (now < this.votingEndTime) {
        this.updateDisplay(this.votingEndTime.getTime() - now.getTime(), 'Election ends in:');
      } else {
        if (this.intervalId) clearInterval(this.intervalId);
        this.updateDisplay(0, 'Election has ended.');
        this.electionEnded.emit();
      }
    }, 1000);
  }

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private updateDisplay(diff: number, label: string) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    this.display = {
      days: this.pad(days),
      hours: this.pad(hours),
      minutes: this.pad(minutes),
      seconds: this.pad(seconds),
      label
    };
  }
}
