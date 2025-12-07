import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import spdy from "spdy";
import app from "./app.js";
import { constants } from "./utils/constants.utils.js";
import initializeSystem from "./utils/system.init.js";
import loggingService from "./services/logging.service.js";

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logging service
const logger = loggingService.getModuleLogger("Server Setup");
const PORT = constants.server.port;
const isHttpsEnabled = constants.isHttp2Enabled ? true : false;
logger.info(
  `Https enabled :------------------------------------------${isHttpsEnabled}`
);

/**
 * Starts the server by:
 * 1. Initializing the system (database, roles, super admin, external services).
 * 2. Starting the server either with HTTP/2 (SSL) or plain HTTP based on configuration.
 */
const startServer = async () => {
  try {
    // Initialize system before starting the server
    const result = await initializeSystem(app); // Pass the app instance to initializeSystem
    logger.info(`[System initialization] : ${result.message}`);

    // Only log server is running after everything is initialized and routes are registered
    if (isHttpsEnabled) {
      const keyPath = path.join(__dirname, "./ssl/server.key");
      const certPath = path.join(__dirname, "./ssl/server.crt");

      // Check if SSL certificates exist
      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        throw new Error("SSL certificates not found!");
      }

      logger.info("SSL certificates loaded from paths:", { keyPath, certPath });

      // HTTP/2 Options with SSL
      const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };

      // Start HTTP/2 server using spdy
      spdy.createServer(options, app).listen(PORT, "0.0.0.0", (err) => {
        if (err) {
          logger.error("Failed to start HTTP/2 server", err);
          return;
        }
        logger.info(`HTTP/2 server is running at https://0.0.0.0:${PORT}`);
      });
    } else {
      // Start regular HTTP server
      app.listen(PORT, "0.0.0.0", (err) => {
        if (err) {
          logger.error("Failed to start Secure backend App", err);
          return;
        }
        logger.info(`Secure backend App is running at http://0.0.0.0:${PORT}`);
      });
    }
  } catch (e) {
    logger.error("System initialization or server startup failed:", e);
  }
};

// Call the startServer function to run the app
startServer();

