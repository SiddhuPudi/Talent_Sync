const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { updateProfile, getProfile } = require("../controllers/profileController");

router.get("/me", authMiddleware, getProfile);
router.put("/update", authMiddleware, updateProfile);

module.exports = router;