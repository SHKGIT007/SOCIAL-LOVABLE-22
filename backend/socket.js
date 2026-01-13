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
      console.log("🔗 Socket user connected:", socket.id);

      socket.on("register", (userId, userType) => {
        onlineUsers[userId] = socket.id;
        console.log(`✅ User ${userId} registered with socket ${socket.id}`);
        console.log("📊 Online users:", onlineUsers);

        // If admin, add to admin sockets set
        if (userType === "admin") {
          adminSockets.add(socket.id);
          console.log(`👨‍💼 Admin connected: ${socket.id}`);
        }
      });

      socket.on("disconnect", () => {
        for (let user in onlineUsers) {
          if (onlineUsers[user] === socket.id) {
            console.log(`❌ User ${user} disconnected`);
            delete onlineUsers[user];
          }
        }
        adminSockets.delete(socket.id);
      });
    });

    return io;
  },

  sendNotification: (userId, data) => {
    console.log(`📢 Sending notification to user ${userId}`);
    console.log("📊 Current online users:", onlineUsers);

    if (!io) {
      console.log("❌ Socket.io not initialized");
      return;
    }

    const socketId = onlineUsers[userId];

    if (socketId) {
      console.log(`✉️ Notification sent to socket ${socketId}`);
      io.to(socketId).emit("receive_notification", data);
    } else {
      console.log(`⚠️ User ${userId} is not online`);
    }
  },

  sendAdminNotification: (data) => {
    console.log(`📢 Broadcasting admin notification to ${adminSockets.size} admins`);

    if (!io) {
      console.log("❌ Socket.io not initialized");
      return;
    }

    // Send to all connected admin sockets
    adminSockets.forEach((socketId) => {
      io.to(socketId).emit("receive_notification", data);
    });
  },
};
