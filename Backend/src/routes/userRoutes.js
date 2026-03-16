const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getCurrentUser } = require("../controllers/userController");
router.get("/me", authMiddleware, getCurrentUser);
module.exports = router;