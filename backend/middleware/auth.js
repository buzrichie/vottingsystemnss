const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');

exports.authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Voter.findById(decoded.id);
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role.toLowerCase() !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};
