const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const { authMiddleware, adminMiddleware, afterElectionMiddleware } = require('../middleware/auth');
const Voter = require('../models/Voter');

async function analyzeVotesP() {
  try {
    // Fetch votes and count voters in parallel
    const [votes, totalVoters, totalVotesCast] = await Promise.all([
      Vote.find(),
      Voter.countDocuments(),
      Voter.countDocuments({ hasVoted: true })
    ]);

    const analyzedResults = {};

    for (const vote of votes) {
      const position = vote.position || 'Unknown';
      if (!analyzedResults[position]) {
        analyzedResults[position] = {
          candidates: [],
          validVotes: 0,
          invalidVotes: 0
        };
      }

      if (vote.position && vote.candidate) {
        analyzedResults[position].validVotes++;
        addVoteP(analyzedResults[position].candidates, vote.candidate);
      } else {
        analyzedResults[position].invalidVotes++;
      }
    }

    return {
      results: analyzedResults,
      stats: {
        totalVoters,
        totalVotesCast
      }
    };
  } catch (error) {
    console.error('Error analyzing votes:', error);
    throw new Error('Error analyzing vote data.');
  }
}

function addVoteP(candidates, candidateName) {
  const existingCandidate = candidates.find(c => c.name === candidateName);

  if (existingCandidate) {
    existingCandidate.votes++;
  } else {
    candidates.push({ name: candidateName, votes: 1 });
  }
}

// Admin dashboard to get results
router.get('/results', authMiddleware, adminMiddleware, async (req, res) => {
  const votes = await Vote.find();
  
  const results = {};

  if (votes.length >0 ) {
    votes.forEach(v => {
      for (let [position, candidate] of Object.entries(v.votes)) {
        if (!results[position]) results[position] = {};
        results[position][candidate] = (results[position][candidate] || 0) + 1;
      }
    });
  }

  res.json(results);
});
router.get('/public-results', afterElectionMiddleware, async (req, res) => {
  try {
    
  const results = await analyzeVotesP();

  return res.json({ results });
  
} catch (error) {
 console.log(error);
    
}
});

module.exports = router;
