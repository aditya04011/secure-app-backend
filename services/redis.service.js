import Redis from "ioredis";
import { constants } from "../utils/constants.utils.js";
import loggerService from "./logging.service.js";

const logger = loggerService.getModuleLogger("Global-Services","Redis Service");

const { redis, isRedisEnabled } = constants;

const redisUrl = `redis://${redis.host}:${redis.port}`;

const redisClient =
  isRedisEnabled &&
  new Redis(redisUrl, {
    keepAlive: 1, // Keep connection alive
    connectTimeout: 10000, //10 seconds
    maxRetriesPerRequest: 5, // before throwing error try connecting 5 times
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000); // Retry with exponential backoff
      return delay;
    }
  });

if (isRedisEnabled) {
  redisClient.on("connect", () => {
    logger.info("Redis connected");
  });

  redisClient.on("error", (err) => {
    logger.error(`Redis error: ${err.message}`, {
      errorCode: err.code,
      stack: err.stack
    });
  });
} else {
  logger.warn("Redis is not enabled. Redis client will not be used.");
}

export default redisClient;
    