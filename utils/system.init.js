import loggingService from "../services/logging.service.js";
import { loadModules } from "../utils/moduleLoader.js"; // Import module loader
import { constants } from "./constants.utils.js";
import path from "path";
import fs from "fs";

// import { saveDefaultSchools } from "./schools.utils.js"; // Import school utils

const logger = loggingService.getModuleLogger("Global-Utils","SystemInitialization");

/**
 * Initializes the entire system in the correct order:
 * 1. Database initialization
 * 2. Role creation
 * 3. Super admin creation
 * 4. Branch creation
 * 5. Fee module initialization
 * 6. Course module initialization
 * 7. External Services Initialization (Elasticsearch, Redis, BullQueue)
 * 8. Module Loading
 * @returns {Promise<void>}
 */
export const initializeSystem = async (app) => {
  logger.info("Starting system initialization...");

  try {

    // Step 1: Loading Modules
    logger.info("Loading application modules...");
    const configPath = path.join(path.resolve(), "config/modules-config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const baseDir = path.resolve();

    loadModules(app, baseDir, config);
    logger.info("Modules loaded successfully");

    logger.info("System initialization completed successfully");
    return {
      success: true,
      message: "System initialized successfully"
    };
  } catch (error) {
    logger.error("System initialization failed:", {
      error: error.message,
      stack: error.stack
    });
    throw new Error(`System initialization failed: ${error.message}`);
  }
};

export default initializeSystem;
