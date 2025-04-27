const mongoose = require('mongoose');
const { Schema } = mongoose;

const VoteSchema = new Schema({
    voterId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    position: {
        type: String,
        required: true,
        trim: true, 
        enum: ["president", "vice president","general secretary", "financial secretary","organizer","wocom"],
        index: true
    },
    candidate: {
        type: String,
        required: true,
        trim: true,
        index: true // For efficient querying of votes for a candidate
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the timestamp when a vote is cast
    },
    // Optional: Add any other relevant information, e.g., timestamp of update
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure that a voter can only vote once per position (optional, but often desired)
VoteSchema.index({ voterId: 1, position: 1 }, { unique: true });

const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;