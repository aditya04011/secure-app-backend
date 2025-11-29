import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively finds all .js files inside any 'models/' folder under modules/
 */
const getAllModelFiles = (dir, files = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "models") {
        // Get all .js files inside the 'models' folder
        const modelFiles = fs
          .readdirSync(fullPath)
          .filter((f) => f.endsWith(".js"))
          .map((f) => path.join(fullPath, f));

        files.push(...modelFiles);
      } else {
        getAllModelFiles(fullPath, files); // Recurse
      }
    }
  }

  return files;
};

/**
 * Dynamically loads all Mongoose models from modules/**//*.js
 */
export const loadAllModels = async (baseDir = path.join(__dirname, "../modules")) => {
  const modelFiles = getAllModelFiles(baseDir);
  const models = {};

  for (const filePath of modelFiles) {
    try {
    const module = await import(pathToFileURL(filePath).href);
      const model = module.default;

      if (model?.modelName) {
        models[model.modelName] = model;
      }
    } catch (err) {
      console.error(`❌ Failed to import model at ${filePath}:`, err.message);
    }
  }
//   console.log(models)
  return models;
};
