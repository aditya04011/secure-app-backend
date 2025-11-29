import express from "express";
import {
  getModulesHandler,
  updateModuleStatusHandler,
} from "../controllers/configuration.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Core - Configuration
 *     description: Configuration module-related endpoints
 */

/**
 * @swagger
 * /api/core/configuration/health:
 *   get:
 *     summary: Health check for the Configuration module
 *     tags: [Core - Configuration]
 *     responses:
 *       200:
 *         description: Configuration module health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Configuration Module loaded successfully
 */
router.get("/health", (req, res) =>
  res.json({ message: "Configuration Module loaded successfully" })
);

/**
 * @swagger
 * /api/core/configuration/modules:
 *   get:
 *     summary: Retrieve a list of modules with their statuses
 *     tags: [Core - Configuration]
 *     responses:
 *       200:
 *         description: List of modules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalModules:
 *                   type: integer
 *                   example: 5
 *                 modules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       moduleName:
 *                         type: string
 *                         example: Authentication
 *                       status:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Internal server error
 */
router.get("/modules", getModulesHandler);

/**
 * @swagger
 * /api/core/configuration/modules/{moduleName}:
 *   put:
 *     summary: Update the status of a specific module
 *     tags: [Core - Configuration]
 *     parameters:
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module to update
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: The status to update the module to (true to enable, false to disable)
 *     responses:
 *       200:
 *         description: Module status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: The module 'Authentication' is enabled
 *       400:
 *         description: Bad request (e.g., invalid module name or status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Module name is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal Server Error
 */

router.put("/modules/:moduleName", updateModuleStatusHandler);

export default {
  path: "/api/core/configuration",
  router,
};
