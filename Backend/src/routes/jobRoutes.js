const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { createJob, updateJob, deleteJob, getJobs, getJob } = require("../controllers/jobController");

router.post("/", authMiddleware, createJob);
router.put("/:id", authMiddleware, updateJob);
router.delete("/:id", authMiddleware, deleteJob);
router.get("/", getJobs);
router.get("/:id", getJob);

module.exports = router;