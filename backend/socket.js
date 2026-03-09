let io;
let onlineUsers = {};
let adminSockets = new Set(); // Track all connected admin sockets

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {

      socket.on("register", (userId, userType) => {
        onlineUsers[userId] = socket.id;

        // If admin, add to admin sockets set
        if (userType === "admin") {
          adminSockets.add(socket.id);
        }
      });

      socket.on("disconnect", () => {
        for (let user in onlineUsers) {
          if (onlineUsers[user] === socket.id) {
            delete onlineUsers[user];
          }
        }
        adminSockets.delete(socket.id);
      });
    });

    return io;
  },

  sendNotification: (userId, data) => {

    if (!io) {
      return;
    }

    const socketId = onlineUsers[userId];

    if (socketId) {
      io.to(socketId).emit("receive_notification", data);
    } else {
    }
  },

  sendAdminNotification: (data) => {

    if (!io) {
      return;
    }

    // Send to all connected admin sockets
    adminSockets.forEach((socketId) => {
      io.to(socketId).emit("receive_notification", data);
    });
  },
};
