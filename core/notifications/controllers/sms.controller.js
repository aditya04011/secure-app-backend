import Queue from "bull";
import { constants } from "../../../utils/constants.utils.js";

const redisConfig = {
  redis: {
    host: constants.redis.host,
    port: constants.redis.port
  }
};

const smsQueue = new Queue("smsQueue", redisConfig);

smsQueue.process("../controllers/sms.controller.js");

export default smsQueue;
