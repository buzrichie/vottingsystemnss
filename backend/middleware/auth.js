const jwt = require("jsonwebtoken");
const Voter = require("../models/Voter");

exports.authMiddleware = async (req, res, next) => {
  const ctoken = req.header("Authorization")?.replace("Bearer ", "");
  if (!ctoken) return res.status(401).json({ message: "No token provided" });

  const token = req.cookies?.accessToken;
  if (!token)
    return res.status(401).json({ message: "No Access token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Voter.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role.toLowerCase() !== "admin")
    return res.status(403).json({ message: "Access denied" });
  next();
};
exports.afterElectionMiddleware = (req, res, next) => {
  const endTime = new Date(process.env.VOTING_END);
  const currentTime = new Date();

  if (currentTime.getTime() < endTime.getTime()) {
    return res.status(403).json({
      success: false,
      message: "Election has not ended. Please check back later.",
    });
  }

  next();
};
