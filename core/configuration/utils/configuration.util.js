import fs from "fs";
import path from "path";

// Helper function to scan directory structure and get modules
export const scanDirectoryForModules = (dirPath, basePath = "") => {
  let modules = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const moduleName = path.join(basePath, entry.name).replace(/\\/g, "/");
      modules.push(moduleName);
      modules = modules.concat(
        scanDirectoryForModules(path.join(dirPath, entry.name), moduleName)
      );
    }
  }
  return modules;
};
