import { renderResults } from "../renderVoteResult.js";
import { fetchConfig, getBaseUri } from "../services/config.js";
import { toggleSpinner } from "../services/toggleSpinner.js";
import { getAdminToken, setAdminToken } from "../services/tokenManager.js";
import {
  getResult,
  getStats,
  setResult,
  setStats,
} from "../services/vote_stats_n_results.js";

const loginPage = document.getElementById("login-page");
const votingPages = document.getElementById("voting-pages");
const thankYouPage = document.getElementById("thank-you");
const adminPanel = document.getElementById("admin-panel");

export async function adminShowResult() {
  try {
    const data = await fetchConfig();
    const baseUri = `${data.baseUri}/api`;
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
      const data = await res.json();
      setAdminToken(data.csrfToken);
      setResult(data.results.results);
      setStats(data.results.stats);
    }

    const results = getResult();
    const stats = getStats();

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
