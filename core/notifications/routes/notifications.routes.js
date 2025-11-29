import express from "express";
import { whatsappController } from "../controllers/whatsapp.controller.js";
import { emailController } from "../controllers/email.controller.js";
import loggingService from "../../../services/logging.service.js";
import notificationControllers from "../controllers/notification.controllers.js";

const logger = loggingService.getModuleLogger("Core->Notifications","NotificationRoutes");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Core - Notifications
 *     description: Endpoints for handling notifications via WhatsApp and Email
 */

/**
 * @swagger
 * /api/core/notification/health:
 *   get:
 *     summary: Health check for the notification module
 *     tags: [Core - Notifications]
 *     responses:
 *       200:
 *         description: Notification module is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Notification module loaded successfully
 */
router.get("/health", (req, res) => {
  res.json({ message: "Notification module loaded successfully" });
});

/**
 * @swagger
 * /api/core/notification/whatsapp:
 *   post:
 *     summary: Send a WhatsApp message
 *     tags: [Core - Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: Recipient's phone number
 *                 example: "+1234567890"
 *               message:
 *                 type: string
 *                 description: The message to send
 *                 example: "Hello, this is a test message."
 *     responses:
 *       200:
 *         description: WhatsApp message queued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "WhatsApp notification queued successfully."
 *                 jobId:
 *                   type: string
 *                   description: Job ID for the queued message
 *                   example: "abc123"
 *       400:
 *         description: Validation failed due to missing recipient or message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Recipient and message are required."
 *       500:
 *         description: Internal server error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An unexpected error occurred."
 */
router.post("/whatsapp", (req, res, next) => {
  logger.info("POST /whatsapp endpoint hit.");
  whatsappController.sendMessage(req, res, next);
});

/**
 * @swagger
 * /api/core/notification/email:
 *   post:
 *     summary: Queue an email for sending
 *     tags: [Core - Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient's email address
 *                 example: "example@example.com"
 *               subject:
 *                 type: string
 *                 description: Subject of the email
 *                 example: "Test Email"
 *               text:
 *                 type: string
 *                 description: Plain text content of the email
 *                 example: "This is a test email."
 *     responses:
 *       200:
 *         description: Email notification queued successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email notification queued successfully."
 *                 jobId:
 *                   type: string
 *                   example: "job1234"
 *       400:
 *         description: Bad Request - Validation failed (missing recipient or content).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Recipient and email content (text or HTML) are required."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error occurred while processing the request."
 */
router.post("/email", (req, res, next) => {
  logger.info("POST /email endpoint hit.");
  emailController.sendEmail(req, res, next);
});


/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", notificationControllers.findAll);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Get a notification by ID
 *     tags: [Notifications]
 */
router.get("/:id", notificationControllers.findOne);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a new notification
 *     description: Creates a notification entry with serviceName and dynamic permissions containing modules and services.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: Name of the notification service
 *                 example: whatsapp
 *               permissions:
 *                 type: object
 *                 description: Dynamic modules with services and enable flags
 *                 example:
 *                   admissions:
 *                     services:
 *                       task:
 *                         enable: true
 *                       discount:
 *                         enable: false
 *                   schedules:
 *                     services:
 *                       students:
 *                         enable: true
 *                       faculty:
 *                         enable: true
 *             required:
 *               - serviceName
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.post("/", notificationControllers.create);


/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Update a notification
 *     description: Updates an existing notification entry by ID with serviceName and permissions.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the notification to update
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: 68c2b5b2043615f74b269a7b
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *                 description: Name of the notification service
 *                 example: whatsapp
 *               permissions:
 *                 type: object
 *                 description: Dynamic modules with services and enable flags
 *                 example:
 *                   admissions:
 *                     services:
 *                       task:
 *                         enable: true
 *                       discount:
 *                         enable: true
 *                   schedules:
 *                     services:
 *                       students:
 *                         enable: false
 *                       faculty:
 *                         enable: true
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put("/:id", notificationControllers.update);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 */
router.delete("/:id", notificationControllers.delete);

export default {
  path: "/api/core/notification",
  router,
};
