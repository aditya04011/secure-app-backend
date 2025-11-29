import Role from "../core/security/models/roles.model.js";
import loggingService from "../services/logging.service.js";

const logger = loggingService.getModuleLogger("Global-Utils","Role and Permissions Utils");

// Define all modules
const MODULES = [
  "configuration",
  "notifications",
  "search",
  "security",
  "administration",
  "admissions",
  "assessments",
  "attendance",
  "batches",
  "branches",
  "classrooms",
  "courses",
  "enquiries",
  "feedback",
  "fees",
  "monitoring",
  "reports",
  "schedules",
  "schools",
  "students",
  "subjects",
  "taskmanagement"
];

// Helper function to create permission object
const createPermissions = (
  newPerm = false,
  editPerm = false,
  deletePerm = false,
  showPerm = false
) => ({
  New: newPerm,
  Edit: editPerm,
  Delete: deletePerm,
  Show: showPerm
});

// Define role configurations
const roleConfigs = {
  owner: {
    name: "owner",
    getPermissions: (module) => createPermissions(true, true, true, true)
  },
  admin: {
    name: "admin",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      return createPermissions(true, true, true, true);
    }
  },
  manager: {
    name: "manager",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      return createPermissions(true, true, false, true);
    }
  },
  faculty: {
    name: "faculty",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      return createPermissions(true, true, false, true);
    }
  },
  staff: {
    name: "staff",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      return createPermissions(false, false, false, true);
    }
  },
  receptionist: {
    name: "receptionist",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      return createPermissions(false, false, false, true);
    }
  },
  student: {
    name: "student",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      if (module === "fees") {
        return createPermissions(true, true, false, true);
      }
      return createPermissions(false, false, false, true);
    }
  },
  parent: {
    name: "parent",
    getPermissions: (module) => {
      if (module === "securityManagement") {
        return createPermissions(false, false, false, false);
      }
      if (module === "fees") {
        return createPermissions(true, true, false, true);
      }
      return createPermissions(false, false, false, true);
    }
  },
  accountant: {
    name: "accountant",
    getPermissions: (module) => {
      if (module === "fees") {
        return createPermissions(true, true, false, true);
      }
      return createPermissions(false, false, false, true);
    }
  }
};

/**
 * Creates a role with specified permissions
 * @param {Object} roleConfig - Configuration for the role
 * @returns {Promise<Object>} Created role object
 */
const createRole = async (roleConfig) => {
  try {
    const permissions = {};

    MODULES.forEach((module) => {
      permissions[module] = {
        New: roleConfig.getPermissions(module).New,
        Edit: roleConfig.getPermissions(module).Edit,
        Delete: roleConfig.getPermissions(module).Delete,
        Show: roleConfig.getPermissions(module).Show
      };
    });

    const roleData = {
      roleName: roleConfig.name,
      permissions
    };

    // Check if role already exists
    const existingRole = await Role.findOne({ roleName: roleConfig.name });

    if (existingRole) {
      logger.info(
        `Role ${roleConfig.name} already exists. Updating permissions...`
      );
      existingRole.permissions = permissions;
      return await existingRole.save();
    }

    // Create new role
    const role = new Role(roleData);
    return await role.save();
  } catch (error) {
    logger.error(`Error creating role ${roleConfig.name}:`, error);
    throw error;
  }
};

/**
 * Initializes all roles in the system
 * @returns {Promise<void>}
 */
export const initializeRoles = async () => {
  logger.info("Starting role initialization...");

  try {
    const roles = Object.values(roleConfigs);
    const results = await Promise.all(
      roles.map((roleConfig) => createRole(roleConfig))
    );

    logger.info("Role initialization completed successfully");

    return results;
  } catch (error) {
    logger.error("Error initializing roles:", error);
    throw error;
  }
};

/**
 * Gets a role by name
 * @param {string} roleName
 * @returns {Promise<Object>} Role object
 */
export const getRoleByName = async (roleName) => {
  try {
    const role = await Role.findOne({ roleName });
    if (!role) {
      throw new Error(`Role ${roleName} not found`);
    }
    return role;
  } catch (error) {
    logger.error(`Error fetching role ${roleName}:`, error);
    throw error;
  }
};

/**
 * Utility function to verify if a role exists
 * @param {string} roleName
 * @returns {Promise<boolean>}
 */
export const roleExists = async (roleName) => {
  const role = await Role.findOne({ roleName });
  return !!role;
};

/**
 * Utility function to save roles in database
 * @returns {Promise<void>}
 */
export const saveRolesInDB = async () => {
  logger.info("Starting to save roles in database...");

  try {
    // Initialize all roles
    const savedRoles = await initializeRoles();

    logger.info("Successfully saved all roles in database");

    return savedRoles;
  } catch (error) {
    logger.error("Failed to save roles in database:", error);
    throw new Error("Failed to save roles in database: " + error.message);
  }
};

export default {
  initializeRoles,
  getRoleByName,
  roleExists,
  saveRolesInDB
};
