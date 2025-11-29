import Queue from "bull";
import { constants } from "../../../utils/constants.utils.js";

const redisConfig = {
  redis: {
    host: constants.redis.host,
    port: constants.redis.port
  }
};

const inAppQueue = new Queue("inAppQueue", redisConfig);

inAppQueue.process("../controllers/inapp.controller.js");

export default inAppQueue;
