const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyOtp } = require("../controllers/authController");

/**
 * @swagger
 * tags:
 *  name: Auth
 *  description: Authentication APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *  post:
 *      summary: Register a new user
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: [name, email, password]
 *                      properties:
 *                          name:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *      responses:
 *          201:
 *              description: User created successfully
*/
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *      summary: Login a user
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: [email, password]
 *                      properties:
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *      responses:
 *          200:
 *              description: Login successful
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/verify-otp:
 *  post:
 *      summary: Verify the OTP sent to email and receive JWT
 *      tags: [Auth]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required: [email, otp]
 *                      properties:
 *                          email:
 *                              type: string
 *                          otp:
 *                              type: string
 *      responses:
 *          200:
 *              description: OTP Verified, login successful
 */
router.post("/verify-otp", verifyOtp);

module.exports = router;