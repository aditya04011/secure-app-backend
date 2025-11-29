import mongoose from "mongoose";
import { getMongoUrl } from "../utils/getUrl.utils.js";
import loggingService from "../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Db-Config","Mongo DB Connection");

export const connectDatabase = async () => {
  try {
    const mongoUrl = getMongoUrl();
    logger.info(`mongourl being used is ${mongoUrl}`);

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✔ Connected to mongodb at ${mongoUrl}`);
    return mongoose.connection;
  } catch (error) {
    logger.error("❌ Error connecting to the database:", error);
    process.exit(1);
  }
};