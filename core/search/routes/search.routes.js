import express from "express";
import { search } from "../controllers/search.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Core - Search
 *     description: Endpoints for searching projects and users
 */

/**
 * @swagger
 * /api/core/search/health:
 *   get:
 *     summary: Health check for the search module
 *     tags: [Core - Search]
 *     description: Verify that the search module is running and accessible.
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Search module loaded successfully
 */
router.get("/health", async (req, res) => {
  res.json({ message: "Search module loaded successfully" });
});

/**
 * @swagger
 * /api/core/search/elasticsearch:
 *   get:
 *     summary: Search projects and users
 *     tags: [Core - Search]
 *     description: Perform a search operation for projects and users using Elasticsearch.
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search query string (required)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: The search type string (optional)
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Unique identifier of the project or user
 *                   name:
 *                     type: string
 *                     description: Name of the project or user
 *                   type:
 *                     type: string
 *                     description: The type of result (e.g., project or user)
 *       400:
 *         description: Bad request (e.g., missing query parameter or invalid type parameter)
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Query parameter is required.
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Error searching data
 */
router.get("/elasticsearch", search);

export default {
  path: "/api/core/search",
  router
};
