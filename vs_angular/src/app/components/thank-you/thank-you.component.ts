import { Component } from '@angular/core';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  template: `
    <div id="thank-you">
      <div class="thank-you-card">
        <div class="checkmark">
          <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="25" fill="none" stroke="#2ebf2e" stroke-width="2"/>
            <path fill="none" stroke="#2ebf2e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 27l8 8 16-16"/>
          </svg>
        </div>
        <h2>Thank you for voting!</h2>
        <p>Your vote has been recorded successfully. The results will be available after the election ends.</p>
      </div>
    </div>
  `,
  styles: [`
    #thank-you {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .thank-you-card {
      background-color: #ffffff;
      max-width: 480px;
      width: 90%;
      margin: 3rem auto;
      padding: 3rem 2rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      text-align: center;
      animation: fadeInUp 0.5s ease;
    }
    .checkmark {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      animation: scaleIn 0.4s ease 0.1s both;
    }
    .checkmark svg {
      width: 100%;
      height: 100%;
    }
    h2 {
      color: #28a745;
      font-size: 1.8rem;
      margin-bottom: 1rem;
    }
    p {
      color: #7f8d88;
      font-size: 1rem;
      line-height: 1.6;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
  `]
})
export class ThankYouComponent {}
