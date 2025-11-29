import Queue from "bull";
import logErrorAndPushToDLQ from "../utils/logErrorAndPushToDLQ.utils.js";
import loggingService from "../../../services/logging.service.js";
import attachQueueEventHandlers from "../utils/queueMonitoring.utils.js";
import { constants } from "../../../utils/constants.utils.js";
import path from "path";
import { BullAdapter, setQueues } from "bull-board";

const logger = loggingService.getModuleLogger("Core-Notifications","EmailQueue");

logger.info("entered Email queue");

const redisConfig = {
  host: constants.redis.host,
  port: constants.redis.port
};

// Define the main Email queue
const emailQueue = new Queue("email", {
  redis: redisConfig
  // Optional: specify queue options here
});
logger.info("entered Email queue and instance created");

// Set up Bull Board with your queue
setQueues([new BullAdapter(emailQueue)]);

// Attach standard event handlers
attachQueueEventHandlers(emailQueue);

// Define queue processing
const workerPath = path.resolve("core/notifications/workers/email.worker.js");

emailQueue.process(workerPath);

// Handle failed jobs by moving them to DLQ
emailQueue.on("failed", async (job, err) => {
  logger.error(`Job failed for recipient ${job.data.recipient}:`, err.message);
  await logErrorAndPushToDLQ(emailQueue, job, err);
});

// Optional: Handle other queue events as needed

export default emailQueue;
