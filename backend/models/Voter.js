const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema({
  nssNumber: { type: String, required: true, unique: true },
  // ghanaPay: { type: String },
  // surname: { type: String },
  // firstName: { type: String },
  // placeOfPosting: { type: String },
  // institutionAttended: { type: String },
  // qualification: { type: String },
  // district: { type: String },
  // region: { type: String },
  hasVoted: { type: Boolean, default: false },
  role: { type: String, enum: ["voter", "admin"], default: "voter" },
  password: { type: String },
});

module.exports = mongoose.model("Voter", voterSchema);
