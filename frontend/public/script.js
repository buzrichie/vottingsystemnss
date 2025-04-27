(function () {const BASE_URL = 'http://localhost:5000/api'; // adjust if hosted elsewhere

// ====== DOM ELEMENTS ======
const loginPage = document.getElementById('login-page');
const votingPages = document.getElementById('voting-pages');
const thankYouPage = document.getElementById('thank-you');
const adminPanel = document.getElementById('admin-panel');
const resultsContainer = document.getElementById('results-container');
const statsContainer = document.getElementById('stats-container');
const loginBtn = document.getElementById('login-btn');
const adminAccessBtn = document.getElementById('admin-access-btn');
const loginMessage = document.getElementById('login-message');
const spinner = document.getElementById("spinner");
const closeAdminBtn = document.getElementById("close-admin-btn")
// const skipWarning = document.getElementById("skip-warning")

let currentPage = 0;
let currentUser = '';
let votes = {};
let token = '';
let data = null;
let adminToken = ""

// ====== DATABASE SIMULATION ======
// const validNSSNumbers = ['1234567890', '0987654321', '1122334455'];

const votingData = [
  {
    position: 'President',
    candidates: [
      { name: 'BENJAMIN NII LOMOETEH BOTCHWAY', title: 'Mr.', image: './image/Benjamin.jpeg' },
      { name: 'PRINCE ATTA-BRUCE', title: 'Mr.', image: './image/Bruce.jpeg' }
    ]
  },
  {
    position: 'Vice President',
    candidates: [
      { name: 'ROCKSON SAMUEL THEOPHILUS', title: 'Mr.', image: './image/Rockson.jpg' },

    ]
  },
  {
    position: 'General Secretary',
    candidates: [
      { name: 'THEODORA BAIDOO', title: 'Ms.', image: './image/Theodora.jpeg' },
    ]
  },
  {
    position: 'Financial Secretary',
    candidates: [
      { name: 'EMMANUELLA MENSAH', title: 'Ms.', image: './image/Emmanuella.jpg' },
    ]
  },
  {
    position: 'Organizer',
    candidates: [
      { name: 'BLESSING BAA-MINTAH', title: 'Ms.', image: './image/BLESSING.jpeg' },
    ]
  },
  {
    position: 'WOCOM',
    candidates: [
      { name: 'SARAH TABI AFRIYIE', title: 'Ms.', image: './image/Serah.jpg' },
    ]
  },
 
];

loginBtn?.addEventListener('click', async () => {
  const nssNumber = document.getElementById('nss-number').value.trim();

  try {
    toggleSpinner(true)
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nssNumber }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    
    token = data.token;
    
    currentUser = nssNumber;
    loginPage.style.display = 'none';
    votingPages.style.display = 'block';
    currentPage = 0;
    votes = {};
    showVotingPage();
  } catch (err) {
    loginMessage.textContent = err.message;
  }finally{
    toggleSpinner(false)
  }
});

function toggleSpinner(value) {
  if (value===true) {
    spinner.style.display = "flex"
  } else {
    spinner.style.display = "none"
  }
}

function showVotingPage() {
  votingPages.innerHTML = '';
  
  if (currentPage >= votingData.length) return;

  const data = votingData[currentPage];
  const title = document.createElement('h2');
  title.textContent = data.position;
  

  votingPages.appendChild(title);
  

  const candidateRow = document.createElement('div');
  candidateRow.className = 'candidate-row';
  // const skipBtn = document.createElement('div');
  // skipBtn.textContent = "Skip"
  // skipBtn.classList.add("skip")
  // votingPages.appendChild(skipBtn);

  data.candidates.forEach(candidate => {
    const box = document.createElement('div');
    box.className = 'candidate';
  
    const img = document.createElement('img');
    img.src = candidate.name
      ? `./image/${capitalizeWords(candidate.name.split(" ")[0])}.jpeg`
      : './image/No.jpeg';
      
    img.alt = candidate.name;
  
    const infoBox = document.createElement('div');
    infoBox.innerHTML = `
      <p><strong>${candidate.title} ${candidate.name.toUpperCase()}</strong></p>
      <p>Candidate for ${data.position}</p>
    `;
  
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `vote-${currentPage}`;
    radio.value = candidate.name.toUpperCase();
  
    box.appendChild(img);
    box.appendChild(infoBox);
    box.appendChild(radio);
    candidateRow.appendChild(box);
  });
  
  // 🆕 ADD this after the loop to handle unopposed positions
  if (data.candidates.length === 1) {
    const noneBox = document.createElement('div');
    noneBox.className = 'candidate';
  
    const noneImg = document.createElement('img');
    noneImg.src = './image/No.jpeg';
    noneImg.alt = 'None of the Above';
  
    const noneInfoBox = document.createElement('div');
    noneInfoBox.innerHTML = `
      <p><strong>NO</strong></p>
      <p>Reject candidate for ${data.position}</p>
    `;
  
    const noneRadio = document.createElement('input');
    noneRadio.type = 'radio';
    noneRadio.name = `vote-${currentPage}`;
    noneRadio.value = 'NO';
  
    noneBox.appendChild(noneImg);
    noneBox.appendChild(noneInfoBox);
    noneBox.appendChild(noneRadio);
    candidateRow.appendChild(noneBox);
  }
  
  votingPages.appendChild(candidateRow);

  const nextBtn = document.createElement('button');
  nextBtn.classList.add("next")
  nextBtn.textContent = currentPage === votingData.length - 1 ? 'Submit' : 'Next';
  nextBtn.addEventListener('click', () => {
    const selected = document.querySelector(`input[name="vote-${currentPage}"]:checked`);
    if (!selected) return alert("Please select a candidate.");

    votes[data.position] = selected.value;
    skipOrNextVotin(); 
  });
  // skipBtn.addEventListener("click",()=>{
  //   skipWarning.style.display = "block"
  //   document.getElementById('modal-background').style.display = 'block';
  //   document.getElementById('modal-background').style.display = 'block';
  // });
  
  votingPages.appendChild(nextBtn);
}

function skipOrNextVotin() {
  currentPage++;

  if (currentPage < votingData.length) {
    showVotingPage();
  } else {
    submitVotes();
  }  

}

document.getElementById("confirm-skip").addEventListener("click",  confirmSkip);
document.getElementById("cancel-skip").addEventListener("click", cancelSkip)
function confirmSkip() {
  skipOrNextVotin()
  document.getElementById('modal-background').style.display = 'none';
  document.getElementById('skip-warning').style.display = 'none';
}

function cancelSkip() {
  document.getElementById('modal-background').style.display = 'none';
  document.getElementById('skip-warning').style.display = 'none';
}

async function submitVotes() {
  try {
    toggleSpinner(true)
    const res = await fetch(`${BASE_URL}/vote/submit`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ votes }),
    });    

    if (!res.ok) throw new Error('Vote submission failed');
    votingPages.style.display = 'none';
    thankYouPage.style.display = 'block';
  } catch (err) {
    alert(err.message);
  }finally{
    toggleSpinner(false)
  }
}
adminAccessBtn.addEventListener('click', showAdminPanel)

async function showAdminPanel() {
  try {
    if (!adminToken) {
    const password = prompt("Enter admin password:");
    toggleSpinner(true)
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (!res.ok) throw new Error('Unauthorized access');

     data = await res.json();
     adminToken = data.token;
  }
    const results = data.results.results;
    const stats = data.results.stats;

    loginPage.style.display = 'none';
    votingPages.style.display = 'none';
    thankYouPage.style.display = 'none';
    adminPanel.style.display = 'block';
    renderResults(results, stats);
  } catch (err) {
    alert(err.message);
  }finally{
    toggleSpinner(false)
  }
};

function renderResults(results, stats) {
  resultsContainer.innerHTML = '';
  statsContainer.innerHTML= ''
  // Create stats summary first
  const statsSection = document.createElement('div');
  statsSection.classList.add('stats-section');

  statsSection.innerHTML = `
      <div class="stat-card">
      <h3>Total Eligible Voters</h3>
      <p>${stats.totalVoters}</p>
    </div>
    <div class="stat-card">
      <h3>Total Votes Cast</h3>
      <p>${stats.totalVotesCast}</p>
    </div>
  `;

  statsContainer.appendChild(statsSection);
  

  // Now render the normal results
  for (let position in results) {
    const section = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = capitalizeWords(position);
    section.appendChild(title);

    results[position].candidates.forEach(candidate => {
      const box = document.createElement('div');
      box.classList.add("candidate-box")
      box.innerHTML = `
      <span class="candidate-s">
      <p><strong>${candidate.name}</strong></p>
      <span>${candidate.votes} vote(s)</span>
      </span>
      <span class="candidate-img">
    <img width="100%" height="100%"
     src="${candidate.name ? `./image/${capitalizeWords(candidate.name.split(' ')[0])}.jpeg` : './image/No.jpeg'}"
     alt="${candidate.name || 'Default Candidate Image'}" />
      </span>
      `;
      
      
      section.appendChild(box);
    });
     // Valid/Invalid Votes Section
     const votesSummary = document.createElement('div');
     votesSummary.classList.add('votes-summary');
     votesSummary.innerHTML = `
       <div>Valid Votes: ${results[position].validVotes}</div>
       <div>Invalid Votes: ${results[position].invalidVotes}</div>
     `;
     section.appendChild(votesSummary);

    resultsContainer.appendChild(section);
  }
}


closeAdminBtn.addEventListener("click",closeAdminPanel)

function closeAdminPanel() {
  adminPanel.style.display = 'none';
  loginPage.style.display = 'block';
}
function capitalizeWords(str) {
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}
})();