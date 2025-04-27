const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Voter = require('../models/Voter');
const { authMiddleware } = require('../middleware/auth');

const validPositions = [
  "president",
  "vice president",
  "general secretary",
  "financial secretary",
  "organizer",
  "wocom"
];


router.post('/submit', authMiddleware, async (req, res) => {
    if(req.user.role.toLowerCase() === 'admin') return res.status(403).json({ message: 'Admin isnt allowed to vote.' });
    const { votes } = req.body;

        try {
        const id = req.user.id;
        const voter = await Voter.findById(id);
        if (!voter) {
            return res.status(403).json({ message: 'Voter not found.' });
        }
        if (voter.hasVoted) {
            return res.status(403).json({ message: 'Vote already cast' });
        }
        const operations = [];

        for (const key in votes) {
            if (Object.hasOwnProperty.call(votes, key) && validPositions.includes(key.toString().toLowerCase())) {
                operations.push({
                    insertOne: {
                        document: {
                            voterId: voter._id,
                            position: key.toString().toLowerCase(),
                            candidate: votes[key],
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    },
                });
            }
        }

        if (operations.length > 0) {
            const result = await Vote.bulkWrite(operations);
            console.log('Bulk write result:', result);

            // Update the voter's hasVoted status
            voter.hasVoted = true;
            await voter.save();

            res.status(200).json({ message: 'Vote submitted successfully.',  result });
        } else {
            voter.hasVoted = true;
            await voter.save();
            res.status(200).json({ message: 'No valid votes to submit.' });
        }

    } catch (error) {
        console.error('Error submitting votes (bulkWrite):', error);
        if (error.code === 11000 && error.message.includes('duplicate key')) {
            return res.status(409).json({ message: 'You have already voted for some of these positions.' });
        }
        res.status(500).json({ message: 'Failed to submit votes.' });
    }
    
});


module.exports = router;
