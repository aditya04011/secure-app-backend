import whatsappService from "../services/whatsapp.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Notifications-Workers","WhatsAppWorker");

export default async function processWhatsAppJob(job) {
  try {
    logger.info(`Processing WhatsApp job: ${job.id}`);
    
    const { recipient, message } = job.data;
    logger.info(`Sending WhatsApp message to: ${recipient}`);

    // Call WhatsApp API
    const response = await whatsappService.sendMessage(recipient, message);

    logger.info(`Message sent successfully for job ${job.id}:`, response);
    return response;
  } catch (error) {
    logger.error(`Failed to process job ${job.id}:`, error.message);
    throw error;
  }
}
