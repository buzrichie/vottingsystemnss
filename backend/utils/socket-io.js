const { Server: HTTPServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const { authenticateSocketJWT } = require('../middleware/socket-io-auth');


let io = null;

/**
 * Initialize the Socket.IO server
 * @param {HTTPServer} httpServer - The HTTP server instance
 */
function initializeSocket(httpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.BASE_URL
        : process.env.LOCAL_BASE_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Apply middleware
  io.use(authenticateSocketJWT);
  const userSockets = new Map();
console.log(" web socket working");

  io.on('connection', (socket) => {
    // Assuming authenticateSocketJWT attaches the user to the socket
    const userId = socket.user.id;

    // Disconnect previous sockets for the same user
    if (userSockets.has(userId)) {
      userSockets.get(userId).forEach((s) => s.disconnect());
    }

    userSockets.set(userId, [socket]);

    socket.on('notification', (data) => {
      if (!data) return;
      socket.join(data); // Join room or channel
    });

    socket.on('disconnect', () => {
      for (const [userId, sockets] of userSockets.entries()) {
        const updatedSockets = sockets.filter((s) => s.id !== socket.id);
        if (updatedSockets.length === 0) {
          userSockets.delete(userId);
        } else {
          userSockets.set(userId, updatedSockets);
        }
      }
    });
  });
}

/**
 * Get the Socket.IO instance
 * @returns {SocketIOServer}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io is not initialized. Call initializeSocket first.');
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
