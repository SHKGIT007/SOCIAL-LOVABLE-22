const router = require("express").Router();
const controller = require("../controllers/notification.controller");

router.post("/send", controller.sendNotification);

module.exports = router;
    