import { fetchConfig, getBaseUri } from "./js/services/config.js";

import { renderResults } from "./js/renderVoteResult.js";

import { getAdminToken } from "./js/services/tokenManager.js";

import {
  getResult,
  getStats,
  setResult,
  setStats,
} from "./js/services/vote_stats_n_results.js";

(async () => {
  // const data = await fetchConfig();
  // const socket = io(data.baseUri);
  // socket.on("connect", () => {
  //   console.log("Client connected successfully!");
  // });
  // socket.on("new:vote", (vote) => {
  //   console.log(vote);
  //   const oldResult = getResult();
  //   const newVotes = vote.result;
  //   const updatedResult = oldResult;
  //   for (const position in newVotes) {
  //     const candidateName = newVotes[position].candidates[0].name; // Ensure position exists
  //     if (!updatedResult[position]) {
  //       updatedResult[position] = {
  //         candidates: [],
  //         validVotes: 1,
  //         invalidVotes: 0,
  //       };
  //     } else {
  //       updatedResult[position].validVotes += 1;
  //     }
  //     const candidate = updatedResult[position].candidates.find(
  //       (c) => c.name === candidateName
  //     );
  //     if (candidate) {
  //       candidate.votes += 1;
  //     } else {
  //       updatedResult[position].candidates.push({
  //         name: candidateName,
  //         votes: 1,
  //       });
  //     }
  //   }
  //   const oldStats = getStats();
  //   oldStats.totalVotesCast += 1;
  //   setResult(updatedResult);
  //   setStats(oldStats);
  //   renderResults(updatedResult, oldStats);
  //   console.log("Client got new vote:", updatedResult);
  // });
  // socket.on("connect_error", (err) => {
  //   console.error("Client connection error:", err);
  // });
  // socket.on("disconnect", (reason) => {
  //   console.log("Client disconnected:", reason);
  // });
})();
