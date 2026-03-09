let io;
let onlineUsers = {}; // userId -> Set of socket IDs
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
        if (!onlineUsers[userId]) {
          onlineUsers[userId] = new Set();
        }
        onlineUsers[userId].add(socket.id);

        // If admin, add to admin sockets set
        if (userType === "admin") {
          adminSockets.add(socket.id);
        }
      });

      socket.on("disconnect", () => {
        for (let userId in onlineUsers) {
          if (onlineUsers[userId].has(socket.id)) {
            onlineUsers[userId].delete(socket.id);
            if (onlineUsers[userId].size === 0) {
              delete onlineUsers[userId];
            }
          }
        }
        adminSockets.delete(socket.id);
      });
    });

    return io;
  },

  sendNotification: (userId, data) => {
    if (!io || !onlineUsers[userId]) {
      return;
    }

    // Send to all connected sockets for this user
    onlineUsers[userId].forEach((socketId) => {
      io.to(socketId).emit("receive_notification", data);
    });
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

  sendBroadcastNotification: (data) => {
    if (!io) {
      return;
    }

    // Send to all connected users
    io.emit("receive_notification", data);
  },
};
