require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate Socket.IO connections using JWT
 * @param {object} socket - The socket object
 * @param {function} next - The callback to signal success or failure
 */
const authenticateSocketJWT = (socket, next) => {
  const token = socket.handshake.query.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

      // Ensure decoded is an object and has id and role
      if (typeof decoded === 'object' && decoded.id && decoded.role) {
        const userId = decoded.id;
        const role = decoded.role;

        // Attach user info to the socket for future access
        socket.user = decoded;

        // Join rooms based on userId and role
        socket.join(userId);
        socket.join(role);

        // console.log(`User ${userId} joined rooms: [${userId}, ${role}]`);
        next();
      } else {
        throw new Error('Invalid token payload');
      }
    } catch (error) {
      console.error('JWT verification error:', error.message);
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
};

module.exports = { authenticateSocketJWT };
