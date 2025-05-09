import { fetchConfig } from "./config.js";
import { renderResults } from "./js/renderVoteResult.js";
import {
  getAdminToken,
  getToken,
  setAdminToken,
  setToken,
} from "./js/tokenManager.js";
import { capitalizeWords } from "./js/utils/capitaliseWord.js";
import { getResult, setResult, setStats } from "./voteStats-Resultt.js";

(async function () {
  const data = await fetchConfig();
  const baseUri = `${data.baseUri}/api`;

  // ====== DOM ELEMENTS ======
  const loginPage = document.getElementById("login-page");
  const votingPages = document.getElementById("voting-pages");
  const thankYouPage = document.getElementById("thank-you");
  const adminPanel = document.getElementById("admin-panel");
  const loginForm = document.getElementById("login-form");
  const adminAccessBtn = document.getElementById("admin-access-btn");
  const loginMessage = document.getElementById("login-message");
  const spinner = document.getElementById("spinner");
  const closeAdminBtn = document.getElementById("close-admin-btn");
  const passwordInput = document.getElementById("password");
  // const skipWarning = document.getElementById("skip-warning")

  let currentPage = 0;
  let votes = {};
  let votingData = [];

  if (window.performance) {
    // Handle initial load OR refresh for /result
    if (window.location.pathname === "/result") {
      showAdminPanel();
    }
  }

  window.addEventListener("popstate", () => {
    if (window.location.pathname === "/") {
      loginPage.style.display = "block";
      votingPages.style.display = "none";
    }
    if (window.location.pathname === "/vote") {
      showVotingPage();
    }
    if (window.location.pathname === "/result") {
      showAdminPanel();
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nssNumber = document.getElementById("nss-number").value.trim();
    const password = passwordInput.value;
    if (!nssNumber) {
      alert("Please Enter NSS NUMBER to proceed voting.");
      return;
    }
    if (!password) {
      alert("Please enter Password.");
      return;
    }
    try {
      toggleSpinner(true);
      const res = await fetch(`${baseUri}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nssNumber, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "Login failed";
        throw new Error(errorMessage);
      }
      const data = await res.json();

      votingData = data.candidates;
      setToken(data.csrfToken);
      currentPage = 0;
      votes = {};

      showVotingPage();
    } catch (err) {
      loginMessage.textContent = err.message;
    } finally {
      toggleSpinner(false);
    }
  });

  function toggleSpinner(value) {
    if (value === true) {
      spinner.style.display = "flex";
    } else {
      spinner.style.display = "none";
    }
  }

  function showVotingPage() {
    if (!getToken()) {
      window.history.replaceState({}, "", "/");
      return;
    }
    history.pushState({}, "", "/vote");
    loginPage.style.display = "none";
    votingPages.style.display = "block";
    votingPages.innerHTML = "";

    if (currentPage >= votingData.length) return;

    const data = votingData[currentPage];
    const title = document.createElement("h2");
    title.textContent = data.position;

    votingPages.appendChild(title);

    const candidateRow = document.createElement("div");
    candidateRow.className = "candidate-row";
    // const skipBtn = document.createElement('div');
    // skipBtn.textContent = "Skip"
    // skipBtn.classList.add("skip")
    // votingPages.appendChild(skipBtn);

    data.candidates.forEach((candidate) => {
      const box = document.createElement("div");
      box.className = "candidate";

      const img = document.createElement("img");
      img.src = candidate.name
        ? `./image/${capitalizeWords(candidate.name.split(" ")[0])}.jpeg`
        : "./image/No.jpeg";

      img.alt = candidate.name;

      const infoBox = document.createElement("div");
      infoBox.innerHTML = `
        <p><strong>${
          candidate.title
        } ${candidate.name.toUpperCase()}</strong></p>
        <p>Candidate for ${data.position}</p>
      `;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `vote-${currentPage}`;
      radio.value = candidate.name.toUpperCase();

      box.appendChild(img);
      box.appendChild(infoBox);
      box.appendChild(radio);
      box.addEventListener("click", () => {
        selectCandidate(box);
      });
      candidateRow.appendChild(box);
    });

    // ADD this after the loop to handle unopposed positions
    if (data.candidates.length === 1) {
      const noneBox = document.createElement("div");
      noneBox.className = "candidate";

      const noneImg = document.createElement("img");
      noneImg.src = "./image/No.jpeg";
      noneImg.alt = "None of the Above";

      const noneInfoBox = document.createElement("div");
      noneInfoBox.innerHTML = `
        <p><strong>NO</strong></p>
        <p>Reject candidate for ${data.position}</p>
      `;

      const noneRadio = document.createElement("input");
      noneRadio.type = "radio";
      noneRadio.name = `vote-${currentPage}`;
      noneRadio.value = "NO";

      noneBox.appendChild(noneImg);
      noneBox.appendChild(noneInfoBox);
      noneBox.appendChild(noneRadio);
      noneBox.addEventListener("click", () => {
        selectCandidate(noneBox);
      });
      candidateRow.appendChild(noneBox);
    }

    votingPages.appendChild(candidateRow);

    const nextBtn = document.createElement("button");
    nextBtn.classList.add("next");
    nextBtn.textContent =
      currentPage === votingData.length - 1 ? "Submit" : "Next";
    nextBtn.addEventListener("click", () => {
      const selected = document.querySelector(
        `input[name="vote-${currentPage}"]:checked`
      );
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

  function selectCandidate(box) {
    const radio = box.querySelector('input[type="radio"]');
    if (radio) {
      radio.checked = true;

      // Remove `.selected` from all siblings
      const allCards = document.querySelectorAll(".candidate");
      allCards.forEach((c) => c.classList.remove("selected"));

      // Add `.selected` to clicked card
      box.classList.add("selected");
    }
  }

  function skipOrNextVotin() {
    currentPage++;

    if (currentPage < votingData.length) {
      showVotingPage();
    } else {
      submitVotes();
    }
  }

  document
    .getElementById("confirm-skip")
    .addEventListener("click", confirmSkip);
  document.getElementById("cancel-skip").addEventListener("click", cancelSkip);
  function confirmSkip() {
    skipOrNextVotin();
    document.getElementById("modal-background").style.display = "none";
    document.getElementById("skip-warning").style.display = "none";
  }

  function cancelSkip() {
    document.getElementById("modal-background").style.display = "none";
    document.getElementById("skip-warning").style.display = "none";
  }

  async function submitVotes() {
    try {
      if (!getToken()) {
        return;
      }
      toggleSpinner(true);
      const res = await fetch(`${baseUri}/vote/submit`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ votes }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "Vote submission failed";
        throw new Error(errorMessage);
      }

      votingPages.style.display = "none";
      thankYouPage.style.display = "block";
    } catch (err) {
      alert(err.message);
    } finally {
      toggleSpinner(false);
    }
  }
  adminAccessBtn.addEventListener("click", async () => {
    try {
      toggleSpinner(true);

      const serverTimef = await fetch(`${baseUri}/server-time`);
      const serverTimefData = await serverTimef.json();
      const serverTime = new Date(serverTimefData.serverTime);
      if (!serverTime) {
        throw new Error("'Error fetching time:'");
      }

      const votingEndTime = new Date("2025-04-30T16:00:00.000Z");
      const clientLoadTime = Date.now();
      const now = new Date(
        serverTime.getTime() + (Date.now() - clientLoadTime)
      );
      if (now < votingEndTime) {
        throw new Error("Election has not ended. Please check back later.");
      }
      const res = await fetch(`${baseUri}/admin/public-results`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "Unauthorized access";
        throw new Error(errorMessage);
      }

      data = await res.json();

      const results = data.results.results;
      const stats = data.results.stats;

      loginPage.style.display = "none";
      votingPages.style.display = "none";
      thankYouPage.style.display = "none";
      adminPanel.style.display = "block";
      renderResults(results, stats);
    } catch (err) {
      loginMessage.textContent = err.message;
    } finally {
      toggleSpinner(false);
    }
  });

  async function showAdminPanel() {
    let data = null;
    try {
      if (!getAdminToken()) {
        const password = prompt("Enter admin password:");
        if (!password || password.trim() === "") {
          throw new Error("Password is required");
        }
        toggleSpinner(true);
        const res = await fetch(`${baseUri}/auth/admin/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage = errorData.message || "Unauthorized access";
          throw new Error(errorMessage);
        }
        data = await res.json();
        setAdminToken(data.csrfToken);
      }
      if (!data) {
        return;
      }
      setResult(data.results.results);
      const results = data.results.results;
      const stats = data.results.stats;
      setStats(stats);

      loginPage.style.display = "none";
      votingPages.style.display = "none";
      thankYouPage.style.display = "none";
      adminPanel.style.display = "block";
      renderResults(results, stats);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      toggleSpinner(false);
    }
  }

  closeAdminBtn.addEventListener("click", closeAdminPanel);

  function closeAdminPanel() {
    adminPanel.style.display = "none";
    loginPage.style.display = "block";
  }
})();
