import {
  getAllModules,
  getModules,
  saveModules
} from "../services/configuration.service.js";
import loggerService from "../../../services/logging.service.js";

// Logger instance
const logger = loggerService.getModuleLogger("Core-Configuration","Configuration of Module Controller");

// API to get all modules with their statuses
export const getModulesHandler = (req, res) => {
  try {
  logger.info("Fetching all modules with their statuses");
  const allModules = getAllModules();
  const enabledModules = getModules();

  // Mapping the modules and checking if their 'name' is present in enabledModules
  const response = allModules.map((module) => ({
    moduleName: module.name,  // Accessing the 'name' property of each module
    status: enabledModules.includes(module.name)  // Checking if the 'name' is in enabledModules
  }));

  res.json({
    totalModules: allModules.length,
    modules: response
  });
  logger.info("Modules fetched successfully");
} catch (error) {
  logger.error("Error fetching modules", error);
  res.status(500).json({ error: "Internal Server Error" });
}

};

// API to update the status of a specific module
// API to update the status of a specific module

 export const updateModuleStatusHandler = (req, res) => {
  try {
    const { moduleName } = req.params;
    const { status } = req.query;
   logger.info(`module name to check:${moduleName}`)

    if (!moduleName) {
      logger.error("Module name is required");
      return res.status(400).json({ error: "Module name is required" });
    }

    if (status !== "true" && status !== "false") {
      logger.error("Invalid status. Use ?status=true or ?status=false");
      return res
        .status(400)
        .json({ error: "Invalid status. Use ?status=true or ?status=false" });
    }

    const allModules = getAllModules();
    // Checking if the module exists by comparing the 'name' property of the module
    const moduleExists = allModules.some(module => module.name === moduleName);

    if (!moduleExists) {
      logger.error(`Module '${moduleName}' does not exist`);
      return res
        .status(400)
        .json({ error: `Module '${moduleName}' does not exist` });
    }

    let enabledModules = getModules();
    const isEnabled = status === "true";

    if (isEnabled) {
      if (!enabledModules.includes(moduleName)) {
        enabledModules.push(moduleName);
      }
    } else {
      enabledModules = enabledModules.filter((mod) => mod !== moduleName);
    }

    saveModules(enabledModules);
    res.json({
      message: `The module '${moduleName}' is ${
        isEnabled ? "enabled" : "disabled"
      }`
    });
    logger.info(`The module '${moduleName}' is ${isEnabled ? "enabled" : "disabled"}`);
  } catch (error) {
    logger.error("Error updating module status", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


