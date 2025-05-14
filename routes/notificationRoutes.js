const express = require("express");
const router = express.Router();
const { sendPush } = require("../controllers/notificationController");

router.post("/", sendPush);

module.exports = router;