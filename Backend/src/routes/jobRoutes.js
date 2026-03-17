const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { createJob, updateJob, deleteJob, getJobs, getJob } = require("../controllers/jobController");

/**
 * @swagger
 * tags:
 *  name: Jobs
 *  description: Job APIs
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  required: [title, description, company, location]
 *                  properties:
 *                      title:
 *                          type: String
 *                      description:
 *                          type: String
 *                      company:
 *                          type: String
 *                      location:
 *                          type: String
 *                      salary:
 *                          type: integer
 *     responses:
 *      201:
 *          description: Job created successfully
 */
router.post("/", authMiddleware, createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *  put:
 *      summary: Update Job (Only owner)
 *      tags: [Jobs]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: integer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          title:
 *                              type: string
 *                          description:
 *                              type: string
 *                          company:
 *                              type: string
 *                          location:
 *                              type: string
 *                          salary:
 *                              type: integer
 *      responses:
 *          200:
 *              description: Job updated successfully
 *          400:
 *              description: Invalid input
 *          403:
 *              description: Not authorized
 *          404:
 *              description: Job not found
 */
router.put("/:id", authMiddleware, updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *  delete:
 *      summary: Delete Job (Only owner)
 *      tags: [Jobs]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Job deleted
 *          403:
 *              description: Not authorized
 */
router.delete("/:id", authMiddleware, deleteJob);

/**
 * @swagger
 * /api/jobs:
 *  get:
 *      summary: Get all jobs (with pagination & filters)
 *      tags: [Jobs]
 *      parameters:
 *          - in: query
 *            name: page
 *            schema:
 *              type: integer
 *          - in: query
 *            name: limit
 *            schema:
 *              type: integer
 *          - in: query
 *            name: location
 *            schema:
 *              type: string
 *          - in: query
 *            name: company
 *            schema:
 *              type: string
 *      responses:
 *          200:
 *              description: List of jobs
 */
router.get("/", getJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *  get:
 *      summary: Get job by ID
 *      tags: [Jobs]
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Job details
 *          404:
 *              description: Job not found
 */
router.get("/:id", getJob);

module.exports = router;