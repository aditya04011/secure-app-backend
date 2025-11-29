import express from "express";
import { documentController } from "../controllers/document.controller.js";
import { authenticateToken } from "../../../core/security/utils/jwt.utils.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure upload directory exists
const uploadPath = "uploads/documents";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer with file filter for accepted types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp"
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   - name: App Specific Modules - Documents
 *     description: Endpoints for managing documents
 */

/**
 * @swagger
 * /api/modules/documents/health:
 *   get:
 *     summary: Health check for the Documents module
 *     tags: [App Specific Modules - Documents]
 *     responses:
 *       200:
 *         description: Documents module loaded successfully
 */
router.get("/health", (req, res) => {
  res.json({ message: "Documents module loaded successfully" });
});

/**
 * @swagger
 * /api/modules/documents:
 *   post:
 *     summary: Upload a new document
 *     tags: [App Specific Modules - Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 example: "ID Proof"
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       400:
 *         description: Invalid file type
 */
router.post("/", upload.single("file"), documentController.create);

/**
 * @swagger
 * /api/modules/documents:
 *   get:
 *     summary: Get all documents
 *     tags: [App Specific Modules - Documents]
 *     responses:
 *       200:
 *         description: A list of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Document'
 *       500:
 *         description: Internal server error
 */
router.get("/", documentController.getAll);

/**
 * @swagger
 * /api/modules/documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [App Specific Modules - Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 *       404:
 *         description: Document not found
 */
router.get("/:id", documentController.getById);

/**
 * @swagger
 * /api/modules/documents/{id}:
 *   put:
 *     summary: Update a document by ID
 *     tags: [App Specific Modules - Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "Updated Type"
 *     responses:
 *       200:
 *         description: Document updated successfully
 */
router.put("/:id", documentController.updateById);

/**
 * @swagger
 * /api/modules/documents/{id}:
 *   delete:
 *     summary: Delete a document by ID
 *     tags: [App Specific Modules - Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.delete("/:id", documentController.deleteById);

/**
 * @swagger
 * /api/modules/documents/view/{id}:
 *   get:
 *     summary: View a document in browser
 *     tags: [App Specific Modules - Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Returns the document file for viewing
 *       404:
 *         description: Document not found
 */
router.get("/view/:id", documentController.view);

/**
 * @swagger
 * /api/modules/documents/download/{id}:
 *   get:
 *     summary: Download a document by ID
 *     tags: [App Specific Modules - Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       404:
 *         description: Document not found
 */
router.get("/download/:id", documentController.download);

// Export route
export default {
  path: "/api/modules/documents",
  router,
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         originalName:
 *           type: string
 *         fileName:
 *           type: string
 *         filepath:
 *           type: string
 *         type:
 *           type: string
 *         mimeType:
 *           type: string
 *         version:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
