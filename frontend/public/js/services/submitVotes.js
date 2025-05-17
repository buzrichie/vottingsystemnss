import { fetchConfig } from "./config.js";
import { toggleSpinner } from "./toggleSpinner.js";
import { getToken } from "./tokenManager.js";

export async function submitVotes(votes) {
  try {
    const data = await fetchConfig();
    const baseUri = `${data.baseUri}/api`;
    if (!getToken()) return;

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
    return res;
  } catch (err) {
    alert(err.message);
    return Promise.reject(err);
  } finally {
    toggleSpinner(false);
  }
}
