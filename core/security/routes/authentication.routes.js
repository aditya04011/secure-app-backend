import express from "express";
import { authController } from "../controllers/auth.controller.js";

// Initialize the router
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Core - Security / Authentication
 *   description: API for managing authentication.
 */

/**
 * @swagger
 * /api/core/security/auth/login:
 *   post:
 *     summary: Logs in a user
 *     description: Authenticates the user and returns an authentication token if successful.
 *     tags: [Core - Security / Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The username of the user.
 *                 example: superadmin@isc.guru
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: Welcome1$
 *     responses:
 *       200:
 *         description: Successful login, returns authentication token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The authentication token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: Invalid username or password.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: An unexpected error occurred.
 */
router.post("/login", authController.login); // Login route, calls authController.login

router.post("/logout", authController.logout);
/**
 * @swagger
 * /api/core/security/auth/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Used to check the health and status of the security module.
 *     tags: [Core - Security / Authentication]
 *     responses:
 *       200:
 *         description: Returns a success message indicating that the security module is loaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Security module loaded successfully"
 */

router.post("/generate-token", authController.generateToken);
router.post("/validate-token", authController.validateToken);
// router.post("/change-password", authController.changePassword);
// router.post("/reset-password", authController.resetPassword);
router.get("/user-info/:userId", authController.getUserInfo);
router.get("/health", (req, res) => {
  // Health check route to verify if the module is loaded
  res.json({ message: "Security module loaded successfully" });
});

export default {
  path: "/api/core/security/auth", // Base path for security/auth routes
  router,
};
