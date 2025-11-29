import emailQueue from "../queues/email.queue.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Notifications","EmailController");

export const emailController = {
  sendEmail: async (req, res, next) => {
    logger.debug("Request received for email:", req.body);
    const { to, subject, text, html } = req.body;
    logger.info("Received request for Email notification service.");

    // Basic validation
    if (!to || (!text && !html)) {
      logger.warn("Validation failed: recipient or content is missing.");
      return res
        .status(400)
        .json({
          error: "Recipient and email content (text or HTML) are required."
        });
    }

    try {
      logger.info("Processing email request");

      // Define job options with retry and backoff
      const jobOptions = {
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: "exponential",
          delay: 5000 // Start with 5 seconds delay
        },
        removeOnComplete: true, // Remove job from queue on success
        removeOnFail: false // Keep failed jobs for DLQ
      };

      // Add job to the queue
      const job = await emailQueue.add(
        {
          to,
          subject: subject || "Notification",
          text,
          html
        },
        jobOptions
      );

      logger.info(
        "Email successfully queued for recipient:",
        to,
        "with Job ID:",
        job.id
      );

      // Respond with Job ID
      res.status(200).json({
        message: "Email notification queued successfully.",
        jobId: job.id
      });
    } catch (error) {
      logger.error("Error while adding message to email queue:", error.message);
      next(error);
    }
  }
};
