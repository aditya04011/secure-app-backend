import Role from "../core/security/models/roles.model.js";
import loggingService from "../services/logging.service.js";

const logger = loggingService.getModuleLogger("Global-Utils","Role Utils");

// Define all modules
const MODULES = [
  "configuration",
  "notifications",
  "search",
  "security", // Corrected module name based on MODULES list
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

// Helper function to create full access permissions
const createFullAccess = () =>
  new Map([
    ["New", true],
    ["Edit", true],
    ["Delete", true],
    ["Show", true]
  ]);

// Helper function to create no access permissions
const createNoAccess = () =>
  new Map([
    ["New", false],
    ["Edit", false],
    ["Delete", false],
    ["Show", false]
  ]);

// Helper function to create access with no delete permission
const createNoDeleteAccess = () =>
  new Map([
    ["New", true],
    ["Edit", true],
    ["Delete", false],
    ["Show", true]
  ]);

// Helper function to create show only access
const createShowOnlyAccess = () =>
  new Map([
    ["New", false],
    ["Edit", false],
    ["Delete", false],
    ["Show", true]
  ]);

// Define restricted modules for owner, admin, manager
const OWNER_ADMIN_MANAGER_RESTRICTED_MODULES = [
  "configuration",
  "notifications",
  "security",
  "monitoring"
];

// Define default roles and their permissions
const defaultRoles = [
  {
    // Superadmin: Full access to everything
    roleName: "superadmin",
    permissions: MODULES.reduce((acc, module) => {
      acc.set(module, createFullAccess());
      return acc;
    }, new Map())
  },
  {
    // Owner: Full access except for restricted modules
    roleName: "owner",
    permissions: MODULES.reduce((acc, module) => {
      if (OWNER_ADMIN_MANAGER_RESTRICTED_MODULES.includes(module)) {
        acc.set(module, createNoAccess());
      } else {
        acc.set(module, createFullAccess());
      }
      return acc;
    }, new Map())
  },
  {
    // Admin: Same as owner but no delete rights anywhere
    roleName: "admin",
    permissions: MODULES.reduce((acc, module) => {
      if (OWNER_ADMIN_MANAGER_RESTRICTED_MODULES.includes(module)) {
        acc.set(module, createNoAccess());
      } else {
        acc.set(module, createNoDeleteAccess()); // No Delete permission
      }
      return acc;
    }, new Map())
  },
  {
    // Manager: Same as admin (for now)
    roleName: "manager",
    permissions: MODULES.reduce((acc, module) => {
      if (OWNER_ADMIN_MANAGER_RESTRICTED_MODULES.includes(module)) {
        acc.set(module, createNoAccess());
      } else {
        acc.set(module, createNoDeleteAccess()); // No Delete permission
      }
      return acc;
    }, new Map())
  },
  {
    // Faculty: No delete, no access to security
    roleName: "faculty",
    permissions: MODULES.reduce((acc, module) => {
      if (module === "security") {
        // Using 'security' from MODULES list
        acc.set(module, createNoAccess());
      } else {
        // Original logic was N=T, E=T, D=F, S=T for non-security
        acc.set(module, createNoDeleteAccess());
      }
      return acc;
    }, new Map())
  },
  {
    // Staff: Show only, no access to security
    roleName: "staff",
    permissions: MODULES.reduce((acc, module) => {
      if (module === "security") {
        // Using 'security' from MODULES list
        acc.set(module, createNoAccess());
      } else {
        // Original logic was N=F, E=F, D=F, S=T for non-security
        acc.set(module, createShowOnlyAccess());
      }
      return acc;
    }, new Map())
  },
  {
    // Receptionist: Show only, no access to security
    roleName: "receptionist",
    permissions: MODULES.reduce((acc, module) => {
      if (module === "security") {
        // Using 'security' from MODULES list
        acc.set(module, createNoAccess());
      } else {
        // Original logic was N=F, E=F, D=F, S=T for non-security
        acc.set(module, createShowOnlyAccess());
      }
      return acc;
    }, new Map())
  },
  {
    // Student: Special access for fees, show only for others, no access to security
    roleName: "student",
    permissions: MODULES.reduce((acc, module) => {
      if (module === "security") {
        // Using 'security' from MODULES list
        acc.set(module, createNoAccess());
      } else if (module === "fees") {
        // Original logic for fees was N=T, E=T, D=F, S=T
        acc.set(module, createNoDeleteAccess());
      } else {
        // Original logic for others was N=F, E=F, D=F, S=T
        acc.set(module, createShowOnlyAccess());
      }
      return acc;
    }, new Map())
  },
  {
    // Parent: Special access for fees, show only for others, no access to security
    roleName: "parent",
    permissions: MODULES.reduce((acc, module) => {
      if (module === "security") {
        // Using 'security' from MODULES list
        acc.set(module, createNoAccess());
      } else if (module === "fees") {
        // Original logic for fees was N=T, E=T, D=F, S=T
        acc.set(module, createNoDeleteAccess());
      } else {
        // Original logic for others was N=F, E=F, D=F, S=T
        acc.set(module, createShowOnlyAccess());
      }
      return acc;
    }, new Map())
  },
  {
    // Accountant: Special access for fees, show only for others, consistent restriction for security
    roleName: "accountant",
    permissions: MODULES.reduce((acc, module) => {
      if (module === "security") {
        // Adding consistent security restriction
        acc.set(module, createNoAccess());
      } else if (module === "fees") {
        // Original logic for fees was N=T, E=T, D=F, S=T
        acc.set(module, createNoDeleteAccess());
      } else {
        // Original logic for others was N=F, E=F, D=F, S=T
        acc.set(module, createShowOnlyAccess());
      }
      return acc;
    }, new Map())
  }
];

/**
 * Saves default roles to the database.
 * If a role already exists, it updates the permissions.
 */
const saveDefaultRoles = async () => {
  logger.info("Starting to save default roles into the database...");

  try {
    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ roleName: role.roleName });

      if (existingRole) {
        logger.info(
          `Role '${role.roleName}' already exists. Updating permissions...`
        );
        // Important: Ensure Mongoose handles Map updates correctly.
        // If direct assignment doesn't work reliably, might need explicit marking:
        // existingRole.permissions = role.permissions;
        // existingRole.markModified('permissions');
        // Or update field by field if issues persist. For now, assume direct works.
        existingRole.permissions = role.permissions;
        await existingRole.save();
      } else {
        logger.info(`Creating role '${role.roleName}'...`);
        const newRole = new Role(role);
        await newRole.save();
      }
    }

    logger.info("Default roles saved/updated successfully.");
  } catch (error) {
    logger.error("Error saving default roles:", error);
    throw error; // Re-throw the error for upstream handling
  }
};

export default saveDefaultRoles;
