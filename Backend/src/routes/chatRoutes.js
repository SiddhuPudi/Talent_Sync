const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getMessages, getUnreadCount, markAsRead } = require("../controllers/chatController");

/**
 * @swagger
 * tags:
 *  name: Chat
 *  description: Real-time chat and messaging APIs
 */

/**
 * @swagger
 * /api/chat/unread/count:
 *  get:
 *      summary: Get total unread messages count
 *      tags: [Chat]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Unread messages count
 *          401:
 *              description: Unauthorized
 */
router.get("/unread/count", authMiddleware, getUnreadCount);

/**
 * @swagger
 * /api/chat/read/{userId}:
 *  put:
 *      summary: Mark messages as read from a specific user
 *      tags: [Chat]
 *      security:
 *          -bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: Sender user Id whose messages should be marked as read
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: Message marked as read
 *          400:
 *              description: Invalid request
 */
router.put("/read/:userId", authMiddleware, markAsRead);

/**
 * @swagger
 * api/chat/{userId}:
 *  get:
 *      summary: Get chat messages between current user and another user
 *      tags: [Chat]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *          - in: path
 *            name: userId
 *            required: true
 *            description: Id of the other user
 *            schema:
 *              type: integer
 *      responses:
 *          200:
 *              description: List of messages
 *          401:
 *              description: Unauthorized
 */
router.get("/:userId", authMiddleware, getMessages);

module.exports = router;