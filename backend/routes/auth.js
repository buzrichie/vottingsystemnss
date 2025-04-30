const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Voter = require('../models/Voter');
const Admin = require('../models/Admin');
const Vote = require('../models/Vote'); 
const customRateLimiter = require('../utils/customRateLimiter');
const fs = require('fs');
const path = require('path');
const { validateVotingTime } = require('../middleware/validateVotingTime');


async function analyzeVotes() {
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
        addVote(analyzedResults[position].candidates, vote.candidate);
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

// Updated helper function
function addVote(candidates, candidateName) {
  const existingCandidate = candidates.find(c => c.name === candidateName);

  if (existingCandidate) {
    existingCandidate.votes++;
  } else {
    candidates.push({ name: candidateName, votes: 1 });
  }
}


router.post('/admin/login',customRateLimiter, async (req, res) => {
  try {
    const { password } = req.body;

  if (!password){
    return res.status(401).json({ message: 'Password is requied' });
  }
  user = await Admin.findOne({role:"admin" });
   if (!user) {
     return res.status(401).json({ message: 'Invalid credentials' });
   }
   // Admin login
  if (user && user.role.toLowerCase() === 'admin') {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
  
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    const results = await analyzeVotes();
  
    const deviceId = req.cookies["deviceId"] || req.ip;
    if (global.ipAttempts && global.ipAttempts[deviceId]) {
      delete global.ipAttempts[deviceId]; 
      
    }
  
    return res.json({ token, role: 'admin', results });
  }  

  }catch(e){
    console.error(e.message)
    return res.status(500).json({ message: 'Internal Server Error.' , error});
  }
})

router.post('/login',validateVotingTime, customRateLimiter, async (req, res) => {
  try {
    const { nssNumber } = req.body;
    if (!nssNumber) return res.status(401).json({ message: 'No NSS number provided' });
  
    const user = await Voter.findOne({ nssNumber });
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (user.hasVoted) {
    return res.status(403).json({ message: 'Already voted.' });
  }
  
  const candidates = await JSON.parse(fs.readFileSync(path.join(__dirname, '../data/candidate.json'), 'utf-8'));
  
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
   // Reset the IP attempts on successful login
   const deviceId = req.cookies["deviceId"] || req.ip;
   if (global.ipAttempts && global.ipAttempts[deviceId]) {
     delete global.ipAttempts[deviceId]; 
   }

  res.json({ token, role: 'voter' , candidates});
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error.' , error});
}
});



module.exports = router;
