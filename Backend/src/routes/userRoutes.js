const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getCurrentUser, searchUsers, getUserById } = require("../controllers/userController");

/**
 * @swagger
 * tags:
 *  name: Users
 *  description: User APIs
 */

/**
 * @swagger
 * /api/users/me:
 *  get:
 *      summary: Get current logged-in user
 *      tags: [Users]
 *      security:
 *          -bearerAuth: []
 *      responses:
 *          200:
 *              description: User details
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * @swagger
 * /api/users/search:
 *  get:
 *      summary: Search users by name query
 *      tags: [Users]
 *      security:
 *          -bearerAuth: []
 */
router.get("/search", authMiddleware, searchUsers);

/**
 * @swagger
 * /api/users/{id}:
 *  get:
 *      summary: Get user by ID explicitly
 *      tags: [Users]
 *      security:
 *          -bearerAuth: []
 */
router.get("/:id", authMiddleware, getUserById);

module.exports = router;