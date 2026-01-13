let io;
let onlineUsers = {};

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");

    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("Socket user connected:", socket.id);

      socket.on("register", (userId) => {
        onlineUsers[userId] = socket.id;
        console.log("Online users:", onlineUsers);
      });

      socket.on("disconnect", () => {
        for (let user in onlineUsers) {
          if (onlineUsers[user] === socket.id) {
            delete onlineUsers[user];
          }
        }
        console.log("User disconnected:", socket.id);
      });
    });

    return io;
  },

  sendNotification: (userId, data) => {
    if (!io) return;

    const socketId = onlineUsers[userId];

    if (socketId) {
      io.to(socketId).emit("receive_notification", data);
    }
  },
};
