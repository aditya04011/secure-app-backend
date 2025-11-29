import Queue from "bull";
import { constants } from "../utils/constants.utils.js";
import loggerService from "./logging.service.js";

const logger = loggerService.getModuleLogger("Global-Services","Bull Queue Service");

const { redis, isBullqueEnabled } = constants;

const redisConfig = {
  redis: {
    host: redis.host,
    port: redis.port
  }
};
const jobQueue = isBullqueEnabled && new Queue("jobQueue", redisConfig);
if (isBullqueEnabled) {
  jobQueue.on("failed", (job, err) => {
    logger.error(`Job ${job.id} failed:`, err);
  });

  jobQueue.on("completed", (job) => {
    logger.info(`Job ${job.id} completed`);
  });
}

export default jobQueue;
