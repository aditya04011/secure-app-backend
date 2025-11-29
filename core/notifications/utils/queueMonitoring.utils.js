// utils/queueMonitoring.utils.js
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Notifications-Utils","QueueMonitoring");

/**
 * Attaches standard event handlers to a given queue.
 *
 * @param {Queue} queue - The Bull queue instance.
 */
export default function attachQueueEventHandlers(queue) {
  // Active
  queue.on("active", (job, jobPromise) => {
    logger.info(`Job started processing: Job ID ${job.id}`);
  });

  // Completed
  queue.on("completed", (job, result) => {
    logger.info(`Job completed successfully: Job ID ${job.id}`);
  });

  // Stalled
  queue.on("stalled", (job) => {
    logger.warn(`Job stalled: Job ID ${job.id}`);
  });

  // Progress
  queue.on("progress", (job, progress) => {
    logger.info(`Job progress: Job ID ${job.id}, Progress: ${progress}%`);
  });

  // Paused
  queue.on("paused", () => {
    logger.info("Queue has been paused");
  });

  // Resumed
  queue.on("resumed", () => {
    logger.info("Queue has been resumed");
  });

  // Removed
  queue.on("removed", (job) => {
    logger.info(`Job removed from the queue: Job ID ${job.id}`);
  });
}
