import loggingService from "../services/logging.service.js";
import { loadModules } from "../utils/moduleLoader.js"; // Import module loader
import elasticsearchClient from "../services/elasticsearch.service.js";
import redisClient from "../services/redis.service.js";
import jobQueue from "../services/bullQueue.service.js";
import { constants } from "./constants.utils.js";
import path from "path";
import fs from "fs";

// import { saveDefaultSchools } from "./schools.utils.js"; // Import school utils

const logger = loggingService.getModuleLogger("Global-Utils","SystemInitialization");

const { isElasticEnabled, isRedisEnabled, isBullqueEnabled } = constants;
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
    // Step 1: Initialize Database
    logger.info("Initializing database...");
    // await connectDatabase();
    logger.info("Database initialization completed");

    // // Step 2: Create Roles
    // logger.info("Creating system roles...");
    // await saveDefaultRoles();
    // logger.info("Roles created successfully");

    // // Step 3: Create Super Admin
    // const result = await createSuperAdmin({ logger });

    // if (result.success) {
    //   console.log("Super Admin setup complete or already exists.");
    //   console.log("User ID:", result.userId);
    //   console.log("Profile ID:", result.profileId);
    //   console.log("Project ID:", result.projectId); // May be undefined if user already existed
    // } else {
    //   console.error("Super Admin setup failed:", result.message);
    // }

    // logger.info("Creating users data with self assigned projects...");
    // await migrateOldUsers()
    //   .then(() => {
    //     logger.info("Migration script completed.");
    //   })
    //   .catch((err) => {
    //     logger.error("Migration script failed:", err);
    //   });
    // logger.info("Users data with self assigned projects created successfully");

    // // Step 4: Create Default Branches
    // logger.info("Creating default branches...");
    // await saveDefaultBranches();
    // logger.info("Default branches created successfully");

    // // Step 5: Initialize Fee Module
    // logger.info("Initializing fee module...");
    // await saveDefaultFees();
    // logger.info("Fee module initialized successfully");

    // // Step 6: Initialize Course Module
    // logger.info("Initializing course module...");
    // await saveDefaultCourses();
    // logger.info("Course module initialized successfully");

    // if (isElasticEnabled) {
    //   // Step 7: Initialize External Services (Elasticsearch, Redis, BullQueue)
    //   try {
    //     const response = await elasticsearchClient.ping();
    //     logger.info("Elasticsearch ping successful", {
    //       status: response.statusCode,
    //       body: response.body
    //     });
    //   } catch (error) {
    //     logger.error("Elasticsearch ping failed", {
    //       message: error.message,
    //       stack: error.stack
    //     });
    //     throw new Error("Elasticsearch initialization failed.");
    //   }
    // } else {
    //   logger.info(
    //     "Elasticsearch is not enabled. Elasticsearch client will not be used."
    //   );
    // }

    // if (isRedisEnabled) {
    //   // Redis Client Initialization
    //   redisClient.on("connect", () => {
    //     logger.info("Redis is ready");
    //   });
    // } else {
    //   logger.info("Redis is not enabled. Redis client will not be used.");
    // }

    // if (isBullqueEnabled) {
    //   // BullQueue Client Initialization
    //   jobQueue.add({ task: "exampleTask" });
    // } else {
    //   logger.info(
    //     "BullQueue is not enabled. BullQueue client will not be used."
    //   );
    // }

    // Step 8: Loading Modules
    logger.info("Loading application modules...");
    const configPath = path.join(path.resolve(), "config/modules-config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const baseDir = path.resolve();

    loadModules(app, baseDir, config);
    logger.info("Modules loaded successfully");

    // Step 9: Save Default Schools Data
    // logger.info("Saving default school data...");
    // await saveDefaultSchools();
    // logger.info("Default school data saved successfully");

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
