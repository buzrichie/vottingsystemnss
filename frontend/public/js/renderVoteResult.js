import { capitalizeWords } from "./utils/capitaliseWord.js";
const resultsContainer = document.getElementById("results-container");
const statsContainer = document.getElementById("stats-container");

export function renderResults(results, stats) {
  history.pushState({}, "", "/result");
  resultsContainer.innerHTML = "";
  statsContainer.innerHTML = "";
  // Create stats summary first
  const statsSection = document.createElement("div");
  statsSection.classList.add("stats-section");

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
    const section = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = capitalizeWords(position);
    section.appendChild(title);
    results[position].candidates.sort((x, y) => y.votes - x.votes);
    results[position].candidates.forEach((candidate) => {
      const box = document.createElement("div");
      box.classList.add("candidate-box");
      box.innerHTML = `
        <span class="candidate-s">
        <p><strong>${candidate.name}</strong></p>
        <span>${candidate.votes} ${
        candidate.votes > 0 ? "votes" : "vote"
      }</span>
        </span>
        <span class="candidate-img">
      <img width="100%" height="100%"
      src="${
        candidate.name
          ? `./image/${capitalizeWords(candidate.name.split(" ")[0])}.jpeg`
          : "./image/No.jpeg"
      }"
      alt="${candidate.name || "Default Candidate Image"}" />
        </span>
        `;

      section.appendChild(box);
    });
    // Valid/Invalid Votes Section
    const votesSummary = document.createElement("div");
    votesSummary.classList.add("votes-summary");
    votesSummary.innerHTML = `
        <div>Valid Votes: ${results[position].validVotes}</div>
        <div>Invalid Votes: ${results[position].invalidVotes}</div>
      `;
    section.appendChild(votesSummary);

    resultsContainer.appendChild(section);
  }
}
