const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const authMiddleware = require("../middlewares/authMiddleware");

const { applyJob, getMyApplications, getApplicationsForJob } = require("../controllers/applicationController");

router.post("/apply", authMiddleware, upload.single("resume"), applyJob);
router.get("/my", authMiddleware, getMyApplications);
router.get("/job/:jobId", authMiddleware, getApplicationsForJob);

module.exports = router;