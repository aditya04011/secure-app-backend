import Queue from "bull";
import logErrorAndPushToDLQ from "../utils/logErrorAndPushToDLQ.utils.js";
import loggingService from "../../../services/logging.service.js";
import attachQueueEventHandlers from "../utils/queueMonitoring.utils.js";
import { constants } from "../../../utils/constants.utils.js";
import { fileURLToPath } from "url";
import path from "path";
import { BullAdapter, setQueues } from "bull-board";

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = loggingService.getModuleLogger("Core-Notifications","WhatsappQueue");
logger.info("Entered Whatsapp queue");

const redisConfig = {
  host: constants.redis.host,
  port: constants.redis.port
};

// Define the main WhatsApp queue
const whatsappQueue = new Queue("whatsapp", { redis: redisConfig });

// Fetch jobs in an async function
(async () => {
  const jobs = await whatsappQueue.getJobs(["waiting", "active", "failed"]);
})();

logger.info("Entered Whatsapp queue and instance created");

// Set up Bull Board with your queue
setQueues([new BullAdapter(whatsappQueue)]);

// Attach standard event handlers
attachQueueEventHandlers(whatsappQueue);

// Define queue processing - use __dirname to resolve the path relative to current file
// Based on your folder structure, the worker is in the same directory level
const workerPath = new URL('../workers/whatsapp.worker.js', import.meta.url).href;
logger.info(`Worker path resolved to: ${workerPath}`);

// Use dynamic import() to load the worker dynamically
whatsappQueue.process(async (job) => {
  try {
    const { default: worker } = await import(workerPath);
    return worker(job);
  } catch (error) {
    logger.error(`Failed to import worker: ${error.message}`);
    throw error;
  }
});

// Handle failed jobs by moving them to DLQ
whatsappQueue.on("failed", async (job, err) => {
  logger.error(`Job failed for recipient ${job.data.recipient}:`, err.message);
  await logErrorAndPushToDLQ(whatsappQueue, job, err);
});

export default whatsappQueue;