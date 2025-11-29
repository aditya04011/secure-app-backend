import fs from "fs";
import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname } from "path";
import loggingService from "../services/logging.service.js";

const logger = loggingService.getModuleLogger("Global-Utils","Swagger Docs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the modules configuration file
const configPath = path.join(__dirname, "..", "config", "modules-config.json");

// Function to safely read JSON file
const readJsonFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    logger.info(`Successfully read JSON file: ${filePath}`);
    return JSON.parse(content);
  } catch (error) {
    logger.error(`Error reading JSON file: ${filePath}`, error);
    return { core: [], modules: [], enabledModules: [] };
  }
};

// Load modules configuration
const modulesConfig = readJsonFile(configPath);
const { core, enabledModules } = modulesConfig;

logger.info(`Loaded core modules: ${JSON.stringify(core)}`);
logger.info(`Loaded enabled modules: ${JSON.stringify(enabledModules)}`);

// Function to collect route files
const collectRouteFiles = (folderPath, allowedModules = null) => {
  if (!fs.existsSync(folderPath)) {
    logger.warn(`Directory does not exist: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath);
  let routeFiles = [];

  files.forEach((fileOrFolder) => {
    const fullPath = path.join(folderPath, fileOrFolder);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const shouldProcessDirectory =
        !allowedModules || allowedModules.includes(fileOrFolder);

      logger.info(
        `Checking directory: ${fileOrFolder} in ${folderPath}, Allowed: ${shouldProcessDirectory}`
      );
      if (shouldProcessDirectory) {
        routeFiles = routeFiles.concat(
          collectRouteFiles(fullPath, allowedModules)
        );
      } else {
        logger.warn(`Skipping directory: ${fileOrFolder} in ${folderPath}`);
      }
    } else if (fileOrFolder.endsWith(".routes.js")) {
      logger.info(`Found route file: ${fullPath}`);
      routeFiles.push(fullPath);
    }
    // else {
    //   logger.debug(`Skipping non-route file: ${fileOrFolder}`);
    // }
  });

  logger.info(
    `Collected route files from ${folderPath}: ${JSON.stringify(routeFiles)}`
  );
  return routeFiles;
};

// Get the project root directory
const projectRoot = path.join(__dirname, "..");

// Collect all routes
const collectAllRoutes = () => {
  const routes = [];

  // Collect routes from core modules (no filtering)
  const corePath = path.join(projectRoot, "core");
  if (fs.existsSync(corePath)) {
    logger.info("Collecting routes from core modules...");
    routes.push(...collectRouteFiles(corePath));
  } else {
    logger.warn(`Core directory not found: ${corePath}`);
  }

  // Collect routes from enabled modules
  const modulesPath = path.join(projectRoot, "modules");
  if (fs.existsSync(modulesPath)) {
    logger.info("Collecting routes from enabled modules...");
    enabledModules.forEach((module) => {
      const modulePath = path.join(modulesPath, module, "routes");
      if (fs.existsSync(modulePath)) {
        logger.info(`Processing routes for module: ${module}`);
        routes.push(...collectRouteFiles(modulePath));
      } else {
        logger.warn(`Routes directory not found for module: ${module}`);
      }
    });
  } else {
    logger.warn(`Modules directory not found: ${modulesPath}`);
  }

  logger.info(`Total routes collected: ${routes.length}`);
  logger.debug(`Collected routes: ${JSON.stringify(routes, null, 2)}`);

  return routes;
};

const allRoutes = collectAllRoutes();

if (!allRoutes.length) {
  logger.error(
    "No route files were collected! Please check directory paths and file extensions."
  );
}

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ISC Unified Platform API Documentation",
      version: "1.0.0",
      description:
        "API documentation for core and enabled modules in the platform"
    },
    servers: [
      {
        url: process.env.BASE_URL,
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: allRoutes
};

// Generate Swagger specification
let specs;
try {
  specs = swaggerJsdoc(options);
  logger.info("Swagger specification generated successfully.");
} catch (error) {
  logger.error("Error generating Swagger specification:", error);
  specs = {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0"
    },
    paths: {}
  };
}

export default specs;
