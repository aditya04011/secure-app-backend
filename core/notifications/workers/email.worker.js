import emailService from "../services/email.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Notifications-Workers","Email Worker");

const processEmailJob = async (job) => {
  try {
    const { to, subject, text, html } = job.data;
    await emailService.sendEmail(to, subject, text, html);
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error("Error in Email worker:", error);
    throw error; // Rethrow to trigger job failure
  }
};

export default processEmailJob;
