const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const { updateProfile, getProfile, getProfileStats } = require("../controllers/profileController");

/**
 * @swagger
 * tags:
 *  name: Profile
 *  description: User profile APIs
 */

/**
 * @swagger
 * /api/profile/me:
 *  get:
 *      summary: Get user profile
 *      tags: [Profile]
 *      security:
 *          -bearerAuth: []
 *      responses:
 *          200:
 *              description: Profile fetched
 */
router.get("/me", authMiddleware, getProfile);

/**
 * @swagger
 * /api/profile/update:
 *  put:
 *      summary: Update or create profile
 *      tags: [Profile]
 *      security:
 *          -bearerAuth: []
 *      requestBody:
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          bio:
 *                              type: string
 *                          skills:
 *                              type: string
 *                          experience:
 *                              type: string
 *                          education:
 *                              type: string
 *      responses:
 *          200:
 *              description: Profile updated
 */
router.put("/update", authMiddleware, updateProfile);

router.get("/stats/:id", authMiddleware, getProfileStats);

module.exports = router;