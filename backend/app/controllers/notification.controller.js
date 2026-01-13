const socket = require("../../socket");

exports.sendNotification = (req, res) => {
  const { userId, message } = req.body;

  socket.sendNotification(userId, {
    message,
    time: new Date(),
  });

  res.json({
    status: true,
    message: "Notification sent successfully",
  });
};
