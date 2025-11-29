import whatsappQueue from "../queues/whatsapp.queue.js";
import loggingService from "../../../services/logging.service.js";
import whatsappTemplates from "../utils/templates.utils.js";

const logger = loggingService.getModuleLogger("Core-Notifications","WhatsappController");

export const whatsappController = {
  sendMessage: async (req, res, next) => {
    logger.debug("Request received for WhatsApp:", req.body);
    const { recipient, templateName, params } = req.body; // Expect template name & parameters
  

    if (!recipient || !templateName || !whatsappTemplates[templateName]) {
      logger.warn("Validation failed: Missing recipient, template name, or invalid template.");
      return res.status(400).json({ error: "Recipient and a valid template name are required." });
    }
    try {
      logger.info("Fetching message template...");
      const message = whatsappTemplates[templateName](...params); // Generate message from template
      const jobOptions = {
        attempts: 5, // Retry up to 5 times
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false
      };

      logger.info("Adding WhatsApp message to queue...");
      const job = await whatsappQueue.add({ recipient, message }, jobOptions);

      logger.info(`Message queued successfully for ${recipient} (Job ID: ${job.id})`);

      res.status(200).json({
        message: "WhatsApp notification queued successfully.",
        jobId: job.id
      });
    } catch (error) {
      logger.error("Error while queuing WhatsApp message:", error.message);
      next(error);
    }
    //  try {
    //   const { phoneNumber, messageType, params } = req.body;
    //   logger.info("Sending WhatsApp message...", { phoneNumber, messageType, params });
    //   await sendWhatsAppMessage(phoneNumber, messageType, params, logger.info, logger.error);
    // } catch (error) {
    //   logger.error("Error while sending WhatsApp message:", error.message);
    //   next(error);
    // }
  }
};
