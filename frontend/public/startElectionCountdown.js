const votingStartTime = new Date('2025-04-30T09:00:00.000Z');
const votingEndTime = new Date('2025-04-30T16:00:00.000Z');

// Save the client load time
const clientLoadTime = Date.now();

async function fetchServerTime() {
    try {
        const BASE_URL = 'https://nss-election.onrender.com/api/server-time';
      const res = await fetch(BASE_URL);
      const data = await res.json();
      return new Date(data.serverTime);
    } catch (error) {
      console.error('Error fetching server time:', error);
      return null;
    }
  }

// Start countdown after getting server time
(async function () {
  const serverTime = await fetchServerTime();
  if (serverTime) {
    startElectionCountdown(serverTime);
  } else {
    console.error('Failed to fetch server time');
  }
})();

export function startElectionCountdown(serverTime) {
    const timerInterval = setInterval(() => {
      // Adjust current time using server time and elapsed time since load
      const now = new Date(serverTime.getTime() + (Date.now() - clientLoadTime));
  
      if (now < votingStartTime) {
        const diff = votingStartTime - now;
        displayCountdown(diff, "Election starts in:");
      } else if (now < votingEndTime) {
        const diff = votingEndTime - now;
        displayCountdown(diff, "Election ends in:");
      } else {
        clearInterval(timerInterval);
        const adminAccessWrapper = document.getElementById('admin-access');
        adminAccessWrapper.style.display = "block"
        displayCountdown(0, "Election has ended.");
      }
    }, 1000);
  }

function displayCountdown(diff, label) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
    document.getElementById('countdown-label').innerText = label;
    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }
  
 
  