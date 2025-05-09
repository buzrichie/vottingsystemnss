const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Voter = require("../models/Voter");
const Admin = require("../models/Admin");
const Vote = require("../models/Vote");
const customRateLimiter = require("../utils/customRateLimiter");
const fs = require("fs");
const path = require("path");
const { validateVotingTime } = require("../middleware/validateVotingTime");

async function analyzeVotes() {
  try {
    // Fetch votes and count voters in parallel
    const [votes, totalVoters, totalVotesCast] = await Promise.all([
      Vote.find(),
      Voter.countDocuments(),
      Voter.countDocuments({ hasVoted: true }),
    ]);

    const analyzedResults = {};

    for (const vote of votes) {
      const position = vote.position || "Unknown";
      if (!analyzedResults[position]) {
        analyzedResults[position] = {
          candidates: [],
          validVotes: 0,
          invalidVotes: 0,
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
        totalVotesCast,
      },
    };
  } catch (error) {
    console.error("Error analyzing votes:", error);
    throw new Error("Error analyzing vote data.");
  }
}

// Updated helper function
function addVote(candidates, candidateName) {
  const existingCandidate = candidates.find((c) => c.name === candidateName);

  if (existingCandidate) {
    existingCandidate.votes++;
  } else {
    candidates.push({ name: candidateName, votes: 1 });
  }
}

router.post("/admin/login", customRateLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(401).json({ message: "Password is required" });
    }

    const user = await Admin.findOne({ role: "admin" });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const atoken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRETC,
      { expiresIn: "2h" }
    );

    // Store JWT in an HttpOnly cookie
    res.cookie("accessToken", atoken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV == "production" ? "None" : "Lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    // Clear any brute force attempt tracking
    const deviceId = req.cookies["deviceId"] || req.ip;
    if (global.ipAttempts && global.ipAttempts[deviceId]) {
      delete global.ipAttempts[deviceId];
    }

    const results = await analyzeVotes();

    return res.json({ csrfToken: token, role: "admin", results });
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error.", error: error.message });
  }
});

router.post(
  "/login",
  validateVotingTime,
  customRateLimiter,
  async (req, res) => {
    try {
      const { nssNumber, password } = req.body;
      if (!nssNumber)
        return res.status(401).json({ message: "No NSS number provided" });
      if (!password)
        return res.status(401).json({ message: "No Password provided" });

      const user = await Voter.findOne({ nssNumber });

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.hasVoted) {
        return res.status(403).json({ message: "Already voted." });
      }
      if (!user.password) {
        return res
          .status(403)
          .json({ message: "Unset Password Contact Admin" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const candidates = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "../data/candidate_awutu.json"),
          "utf-8"
        )
      );

      // Create JWT
      const atoken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRETC,
        { expiresIn: "2h" }
      );

      // Store JWT in HttpOnly cookie
      res.cookie("accessToken", atoken, {
        httpOnly: true,
        secure: true,
        sameSite: process.env.NODE_ENV == "production" ? "None" : "Lax",
        maxAge: 2 * 60 * 60 * 1000,
      });

      // Reset IP-based attempts
      const deviceId = req.cookies["deviceId"] || req.ip;
      if (global.ipAttempts && global.ipAttempts[deviceId]) {
        delete global.ipAttempts[deviceId];
      }

      res.json({ csrfToken: token, role: "voter", candidates });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal Server Error.", error: error.message });
    }
  }
);

module.exports = router;
