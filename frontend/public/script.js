import { fetchConfig } from "./js/services/config.js";
import { renderResults } from "./js/renderVoteResult.js";
import {
  getAdminToken,
  getToken,
  setAdminToken,
  setToken,
} from "./js/services/tokenManager.js";
import { capitalizeWords } from "./js/utils/capitaliseWord.js";
import {
  getResult,
  getStats,
  setResult,
  setStats,
} from "./js/services/vote_stats_n_results.js";
import { adminShowResult } from "./js/utils/adminShowResult.js";
import { toggleSpinner } from "./js/services/toggleSpinner.js";
import { submitVotes } from "./js/services/submitVotes.js";
import { fetchAllImageFiles } from "./js/services/fetchAllImages.js";

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
  const closeAdminBtn = document.getElementById("close-admin-btn");
  const passwordInput = document.getElementById("password");
  // const skipWarning = document.getElementById("skip-warning")

  let currentPage = 0;
  let votes = {};
  let votingData = [];

  window.addEventListener("popstate", () => {
    if (window.location.pathname === "/") {
      loginPage.style.display = "block";
      votingPages.style.display = "none";
    }
    if (window.location.pathname === "/vote") {
      showVotingPage();
    }
    if (window.location.pathname === "/result") {
      adminShowResult();
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

      fetchAllImageFiles();
      showVotingPage();
    } catch (err) {
      loginMessage.textContent = err.message;
    } finally {
      toggleSpinner(false);
    }
  });

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
        ? `./images/${capitalizeWords(candidate.name.split(" ")[0])}.jpeg`
        : "./images/No.jpeg";

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
      noneImg.src = "./images/No.jpeg";
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

  async function skipOrNextVotin() {
    currentPage++;
    if (currentPage < votingData.length) {
      showVotingPage();
    } else {
      if (!votes) {
        alert("No candidate selected.");
      }
      await submitVotes(votes)
        .then((res) => {
          console.log(res);
          votingPages.style.display = "none";
          thankYouPage.style.display = "block";
        })
        .catch((err) => {
          console.error("Submission failed", err);
        });
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
      const currentTime = new Date(
        serverTime.getTime() + (Date.now() - clientLoadTime)
      );
      if (currentTime < votingEndTime && !getAdminToken()) {
        throw new Error("Election has not ended. Please check back later.");
      }

      if (currentTime > votingEndTime && !getResult()) {
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

        const clintData = await res.json();
        setResult(clintData.results.results);
        setStats(clintData.results.stats);
        const results = getResult();
        const stats = getStats();

        loginPage.style.display = "none";
        votingPages.style.display = "none";
        thankYouPage.style.display = "none";
        adminPanel.style.display = "block";
        renderResults(results, stats);
      } else {
        adminShowResult();
      }
    } catch (err) {
      loginMessage.textContent = err.message;
    } finally {
      toggleSpinner(false);
    }
  });

  closeAdminBtn.addEventListener("click", closeAdminPanel);

  function closeAdminPanel() {
    adminPanel.style.display = "none";
    loginPage.style.display = "block";
    if (getAdminToken()) {
      document.getElementById("admin-access").style.display = "block";
    } else {
      document.getElementById("admin-access").style.display = "none";
    }
  }
})();
