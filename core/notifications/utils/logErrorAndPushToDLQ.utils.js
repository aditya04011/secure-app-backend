// utils/logErrorAndDLQ.utils.js
import deadLetterQueue from "../queues/deadLetter.queue.js"; // Adjust the path as necessary
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Notifications-Utils","DeadLetterQueue");

/**
 * Logs an error and pushes the failed job to the Dead Letter Queue.
 *
 * @param {Queue} queue - The queue where the job failed.
 * @param {Job} job - The failed job.
 * @param {Error} error - The error that caused the failure.
 */
export default async function logErrorAndPushToDLQ(queue, job, error) {
  // Log the error
  logger.error(`Failed in ${queue.name}: ${error.message}`, {
    jobId: job.id,
    data: job.data,
    stack: error.stack
  });

  // Add the failed job details to the Dead Letter Queue
  await deadLetterQueue.add({
    originalQueue: queue.name,
    originalJobId: job.id,
    originalJobData: job.data,
    error: error.message,
    stack: error.stack,
    failedAt: new Date()
  });
}
