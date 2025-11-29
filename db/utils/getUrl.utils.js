import dotenv from 'dotenv';
dotenv.config(); // 👈 Load .env first
import { constants } from "../../utils/constants.utils.js";
import loggerService from "../../services/logging.service.js";

const logger = loggerService.getModuleLogger("Db-Utils","MongoURL Generator");

/**
 * Validates that a required configuration value is provided.
 * @param {string} value - The value to validate.
 * @param {string} name - The name of the configuration property.
 */
const validateConfigValue = (value, name) => {
  if (!value) {
    throw new Error(`Missing required MongoDB configuration: ${name}`);
  }
};

/**
 * Constructs the MongoDB connection URL.
 * @returns {string} The constructed MongoDB URL.
 */
export const getMongoUrl = () => {
  try {
    const { user, password, ip, port, dbname } = constants.mongo;

    // Validate required configuration values
    validateConfigValue(ip, "MongoDB IP");
    validateConfigValue(port, "MongoDB Port");
    validateConfigValue(dbname, "MongoDB Database Name");

    // Construct the URL
    const credentials = user && password ? `${user}:${password}@` : "";
    const mongoUrl = `mongodb://${credentials}${ip}:${port}/${dbname}`;

    logger.info("MongoDB URL successfully constructed.");
    return mongoUrl;
  } catch (error) {
    logger.error("Error constructing MongoDB URL:", {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};
