const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getMessages } = require("../controllers/chatController");

router.get("/:userId", authMiddleware, getMessages);

module.exports = router;