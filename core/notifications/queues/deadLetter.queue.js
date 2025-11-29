import Queue from "bull";
import loggingService from "../../../services/logging.service.js";
import { constants } from "../../../utils/constants.utils.js";

const logger = loggingService.getModuleLogger("Core-Notifications","Dead Letter queue");

const redisConfig = {
  host: constants.redis.host,
  port: constants.redis.port
};

// Create a generic Dead Letter Queue
const deadLetterQueue = new Queue("dead-letter", {
  redis: redisConfig
});

// Process DLQ jobs (optional: handle logging, alerts, etc.)
deadLetterQueue.process(async (job) => {
  // Implement what should happen with DLQ jobs
  // For example, log to a database, notify admins, etc.
  logger.error("DLQ Job:", job.data);
  // You can integrate with monitoring tools or send alerts here
});

export default deadLetterQueue;
