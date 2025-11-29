import Branch from "../modules/branches/models/branch.model.js";
import loggingService from "../services/logging.service.js";

const logger = loggingService.getModuleLogger("Global-Utils","Branches Utils");

const defaultBranches = [
  { branchName: "RajajiNagar 1st Block" },
  { branchName: "RajajiNagar 4th Block" },
  { branchName: "RajajiNagar PUC" },
  { branchName: "Malleshwaram" },
  { branchName: "Malleshwaram PUC" },
  { branchName: "BasaveshwarNagar" },
  { branchName: "BasaveshwarNagar PUC" },
  { branchName: "Nagarbhavi" }
];

/**
 * Saves default branches to the database.
 * If a branch already exists, it updates the label.
 */
const saveDefaultBranches = async () => {
  logger.info("Starting to save default branches into the database...");

  try {
    for (const branch of defaultBranches) {
      const existingBranch = await Branch.findOne({ branchName: branch.branchName });

      if (existingBranch) {
        logger.info(`Branch '${branch.branchName}' already exists. Skipping...`);
      } else {
        logger.info(`Creating branch '${branch.branchName}'...`);

        const newBranch = new Branch({
          ...branch,
          branchCode: branch.branchName.replace(/\s+/g, "_").toUpperCase(), // Generate branchCode
          primaryContact: "9999999999", // Default placeholder
          address: "Default Address, City, Country" // Default placeholder
        });

        await newBranch.save();
      }
    }

    logger.info("Default branches saved successfully.");
  } catch (error) {
    logger.error("Error saving default branches:", error);
    throw error;
  }
};

export default saveDefaultBranches;
