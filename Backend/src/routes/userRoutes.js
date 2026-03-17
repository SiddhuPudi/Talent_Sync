const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getCurrentUser } = require("../controllers/userController");

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
module.exports = router;