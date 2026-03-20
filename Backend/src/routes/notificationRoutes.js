const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getNotifications, markRead } = require("../controllers/notificationController");

/**
 * @swagger
 * tags:
 *  name: Notifications
 *  description: Notification APIs
 */

/**
 * @swagger
 * /api/notifications:
 *  get:
 *      summaty: Get all notifications
 *      tags: [Notifications]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: List of Notifications
 */
router.get("/", authMiddleware, getNotifications);

/**
 * @swagger
 * /api/notifications/read/{id}:
 *  put:
 *      summary: Mark notifications as read
 *      tags: [Notifications]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *              description: Notification updated
 */
router.put("/read/:id", authMiddleware, markRead);

module.exports = router;