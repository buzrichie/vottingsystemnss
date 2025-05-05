const { Server: HTTPServer } = require("http");
const { Server: SocketIOServer } = require("socket.io");

let io = null;

/**
 * Initialize the Socket.IO server
 * @param {HTTPServer} httpServer - The HTTP server instance
 */
function initializeSocket(httpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.BASE_URL
          : [process.env.LOCAL_BASE_URL, process.env.BACKEND_SIO],
      methods: ["GET", "POST"],
    },
  });

  // Apply middleware
  //   io.use(authenticateSocketJWT);
  //   const userSockets = new Map();
  console.log(" web socket working");

  io.on("connection", (socket) => {
    // Assuming authenticateSocketJWT attaches the user to the socket
    const clientIP = socket.handshake.address;
    const socketId = socket.id;
    console.log(
      `[Socket.IO] New client connected: ID=${socketId}, IP=${clientIP}`
    );

    socket.on("notification", (data) => {});

    socket.on("disconnect", () => {});
  });
}

/**
 * Get the Socket.IO instance
 * @returns {SocketIOServer}
 */
function getIO() {
  if (!io) {
    throw new Error(
      "Socket.io is not initialized. Call initializeSocket first."
    );
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
