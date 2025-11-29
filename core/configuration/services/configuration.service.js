import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "config/enabledModule.json");
const allModulesPath = path.join(process.cwd(), "config/allModules.json");
const coreModulesPath = path.join(process.cwd(), "core");
const additionalModulesPath = path.join(process.cwd(), "modules");

// List of folders to exclude from module scanning
const EXCLUDED_FOLDERS = ["template"];

// Helper function to scan for valid modules in a directory
const scanModuleDirectory = (dirPath) => {
  try {
    const items = fs.readdirSync(dirPath);
    return items
      .filter((item) => {
        // Exclude folders from the EXCLUDED_FOLDERS list
        if (EXCLUDED_FOLDERS.includes(item.toLowerCase())) {
          return false;
        }

        const fullPath = path.join(dirPath, item);
        // Check if it's a directory and contains a manifest.json
        return (
          fs.statSync(fullPath).isDirectory() &&
          fs.existsSync(path.join(fullPath, "manifest.json"))
        );
      })
      .map((item) => ({
        name: item,
        path: dirPath,
        type: dirPath.includes("core") ? "core" : "module"
      }));
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
    return [];
  }
};

// Fetch all modules from both core and modules directories
export const fetchDynamicModules = () => {
  try {
    // Scan both directories
    const coreModules = fs.existsSync(coreModulesPath)
      ? scanModuleDirectory(coreModulesPath)
      : [];

    const additionalModules = fs.existsSync(additionalModulesPath)
      ? scanModuleDirectory(additionalModulesPath)
      : [];

    // Combine both results
    return [...coreModules, ...additionalModules];
  } catch (error) {
    console.error("Error scanning modules:", error);
    return [];
  }
};

// Get all modules and update allModules.json
export const getAllModules = () => {
  try {
    const dynamicModules = fetchDynamicModules();
    const content = JSON.stringify({ modules: dynamicModules }, null, 2);
    fs.writeFileSync(allModulesPath, content);
    return dynamicModules;
  } catch (error) {
    console.error("Error fetching all modules:", error);
    return [];
  }
};

// Read enabled modules
export const getModules = () => {
  try {
    if (!fs.existsSync(configPath)) {
      return [];
    }
    const data = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return data.enabledModules || [];
  } catch (error) {
    console.error("Error reading enabledModule.json:", error);
    return [];
  }
};

// Save enabled modules
export const saveModules = (modules) => {
  try {
    const content = JSON.stringify({ enabledModules: modules }, null, 2);
    fs.writeFileSync(configPath, content);
  } catch (error) {
    console.error("Error saving modules:", error);
  }
};

// Initialize enabled modules if config doesn't exist
if (!fs.existsSync(configPath)) {
  saveModules([]);
}
