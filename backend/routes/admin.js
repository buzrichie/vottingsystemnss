const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

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

module.exports = router;
