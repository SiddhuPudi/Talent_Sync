const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { sendRequest, respondRequest, getConnections, getPendingRequests } = require("../controllers/connectionController");

/**
 * @swagger
 * tags:
 *  name: Connections
 *  description: User connection APIs
 */

/**
 * @swagger
 * /api/connections/send:
 *  post:
 *      summary: Send connection request
 *      tags: [Connections]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: [receiverId]
 *                      properties:
 *                          receiverId:
 *                              type: integer
 *      responses:
 *          200:
 *              description: Request sent successfully
 *          400:
 *              description: Duplicate or invalid request
 */
router.post("/send", authMiddleware, sendRequest);

/**
 * @swagger
 * /api/connections/pending:
 *  get:
 *      summary: Get pending connection requests
 *      tags: [Connections]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Pending requests list
 */
router.get("/pending", authMiddleware, getPendingRequests);

/**
 * @swagger
 * /api/connections/respond/{id}:
 *  put:
 *      summary: Accept or reject connection request
 *      tags: [Connections]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            schema:
 *              type: integer
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: [status]
 *                      properties:
 *                          status:
 *                              type: string
 *                              enum: [accepted, rejected]
 *      responses:
 *          200:
 *              description: Result updated
 *          400:
 *              description: Invalid or unauthorized
 */
router.put("/respond/:id", authMiddleware, respondRequest);

/**
 * @swagger
 * /api/connections:
 *  get:
 *      summary: Get accepted connections
 *      tags: [Connections]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: List of connections
 */
router.get("/", authMiddleware, getConnections);

module.exports = router;