import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import Ajv from "ajv";
import loggingService from "../services/logging.service.js";
import { constants } from "./constants.utils.js";

const logger = loggingService.getModuleLogger("Global-Utils","ModuleLoader");
const ajv = new Ajv();

const manifestSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    version: { type: "string" },
    description: { type: "string" },
    dependencies: { type: "array", items: { type: "string" } },
    routes: { type: "array", items: { type: "string" } },
  },
  required: ["routes"],
  additionalProperties: false,
};

const validateManifest = ajv.compile(manifestSchema);

const activeModules = new Map();
const loadedModules = new Set(); // Track manifest-loaded modules

const loadModules = async (
  app,
  baseDir,
  config,
  haltOnCriticalError = false
) => {
  const loadManifests = async (modulesDir, modules) => {
    const manifests = {};

    for (const module of modules) {
      const manifestPath = path.join(modulesDir, module, "manifest.json");
      try {
        // Check if the manifest file exists before attempting to read it
        await fs.access(manifestPath);

        const manifestContent = await fs.readFile(manifestPath, "utf8");
        const manifest = JSON.parse(manifestContent);

        if (!validateManifest(manifest)) {
          logger.error(
            `Invalid manifest for module "${module}":`,
            validateManifest.errors
          );

          if (haltOnCriticalError) {
            throw new Error(`Invalid manifest for module "${module}"`);
          } else {
            // Skip this module but continue with others
            continue;
          }
        }

        manifests[module] = manifest;
        loadedModules.add(module); // Track manifest loaded modules
        logger.info(`Module "${module}" manifest loaded.`);
      } catch (error) {
        if (error.code === "ENOENT") {
          // File doesn't exist, log it but don't treat as critical error
          logger.warn(
            `Manifest file not found for module "${module}". Skipping module.`
          );
        } else {
          logger.error(`Error loading manifest for module "${module}":`, error);
          if (haltOnCriticalError) throw error;
        }
      }
    }

    return manifests;
  };

  const registerRoutes = async (app, baseDir, module, manifest, isCore) => {
    if (activeModules.has(module)) {
      logger.debug(`Routes already registered for module "${module}"`);
      return;
    }

    // Skip modules with no manifest (likely missing manifest.json file)
    if (!manifest) {
      logger.debug(
        `Skipping route registration for module "${module}" (no manifest)`
      );
      return;
    }

    const moduleDir = isCore
      ? path.join(baseDir, "core", module)
      : path.join(baseDir, "modules", module);

    logger.debug(`Registering routes for module "${module}"...`);
    if (!manifest.routes || manifest.routes.length === 0) {
      logger.warn(`No routes defined for module "${module}"`);
      return;
    }

    const registeredRoutes = [];

    for (const routeFile of manifest.routes) {
      try {
        const normalizedRouteFile = routeFile.startsWith("/")
          ? routeFile.slice(1)
          : routeFile;

        const routePath = path.join(moduleDir, normalizedRouteFile);

        // Check if the route file exists before attempting to import it
        try {
          await fs.access(routePath);
        } catch (error) {
          logger.warn(
            `Route file not found: ${routePath} for module "${module}". Skipping.`
          );
          continue;
        }

        const routeURL = pathToFileURL(routePath);

        logger.debug(
          `Attempting to register route "${normalizedRouteFile}" for module "${module}" at resolved path: ${routePath}`
        );

        const importedModule = await import(routeURL);
        const route = importedModule.default;

        if (!route || !route.path || !route.router) {
          logger.error(
            `Invalid route structure in "${routeFile}" for module "${module}". Expected { path, router } but got: ${JSON.stringify(
              route
            )}`
          );
          continue;
        }

        app.use(route.path, route.router);
        registeredRoutes.push(route.path);
        logger.info(`Route "${route.path}" registered for module "${module}".`);
      } catch (error) {
        logger.error(
          `Error registering route "${routeFile}" for module "${module}":`,
          {
            message: error.message,
            stack: error.stack,
            code: error.code,
            details: JSON.stringify(error, Object.getOwnPropertyNames(error)),
          }
        );
        if (haltOnCriticalError) throw error;
      }
    }

    activeModules.set(module, { manifest, registeredRoutes });
  };

  try {
    logger.info("Loading core modules...");
    const coreModulesDir = path.join(baseDir, "core");
    const coreModules = await fs.readdir(coreModulesDir);
    const coreManifests = await loadManifests(coreModulesDir, coreModules);
    logger.warn("coreModules",{coreManifests})

    // Process core modules sequentially to avoid potential race conditions
    for (const module of coreModules) {
      await registerRoutes(app, baseDir, module, coreManifests[module], true);
    }

    logger.info("Loading application modules...");
    const enabledModules = config.enabledModules || [];
    const modulesDir = path.join(baseDir, "modules");

    const moduleManifests = {
      ...coreManifests,
      ...(await loadManifests(modulesDir, enabledModules)),
    };

    // Process enabled modules sequentially
    for (const module of enabledModules) {
      await registerRoutes(
        app,
        baseDir,
        module,
        moduleManifests[module],
        false
      );
    }

    logger.info("Module loading complete.");
    const {server} = constants
    logger.info(`Server started on port: ${server?.port}`);
  } catch (error) {
    logger.error("Critical error during module loading:", error);
    if (haltOnCriticalError) {
      throw error;
    }
  }

  return {
    unregisterModule: async (app, module) => {
      const moduleInfo = activeModules.get(module);
      if (!moduleInfo) {
        logger.warn(`Module "${module}" is not currently active.`);
        return;
      }

      logger.info(`Unregistering module "${module}"...`);

      for (const routePath of moduleInfo.registeredRoutes) {
        app._router.stack = app._router.stack.filter(
          (layer) => !(layer.route && layer.route.path === routePath)
        );
        logger.info(
          `Route "${routePath}" unregistered for module "${module}".`
        );
      }

      activeModules.delete(module);
    },
  };
};

export { loadModules };
