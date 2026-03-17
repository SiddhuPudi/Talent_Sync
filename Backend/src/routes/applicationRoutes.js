const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const authMiddleware = require("../middlewares/authMiddleware");

const { applyJob, getMyApplications, getApplicationsForJob } = require("../controllers/applicationController");

/**
 * @swagger
 * tags:
 *  name: Applications
 *  description: Job application APIs
 */

/**
 * @swagger
 * /api/applications/apply:
 *  post:
 *      summary: Apply to a job
 *      tags: [Applications]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          content:
 *              multipart/form-data:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          jobId:
 *                              type: integer
 *                          resume:
 *                              type: string
 *                              format: binary
 *      responses:
 *          201:
 *              description: Application submitted
 *          400:
 *              description: Already applied
 */
router.post("/apply", authMiddleware, upload.single("resume"), applyJob);

/**
 * @swagger
 * /api/applications/my:
 *  get: 
 *      summary: Get my applications
 *      tags: [Applications]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: List of user applications
 */
router.get("/my", authMiddleware, getMyApplications);

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *  get:
 *      summary: Get applications for a job
 *      tags: [Applications]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: jobId
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: List of applicants
 */
router.get("/job/:jobId", authMiddleware, getApplicationsForJob);

module.exports = router;