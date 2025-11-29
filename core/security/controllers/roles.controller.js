import * as rolesService from "../services/roles.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Security","RolesController");

const roleController = {
  async create(req, res, next) {
    try {
      logger.info("Creating new role");
      const role = await rolesService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      logger.error("Error creating role:", error);
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      logger.info("Fetching all roles");
      const roles = await rolesService.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      logger.error("Error fetching roles:", error);
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      logger.info("Fetching role by ID", { id: req.params.id });
      const role = await rolesService.getRoleById(req.params.id);
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.status(200).json(role);
    } catch (error) {
      logger.error("Error fetching role:", error);
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      logger.info("Updating role", { id: req.params.id });
      const role = await rolesService.updateRoleById(req.params.id, req.body);
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.status(200).json(role);
    } catch (error) {
      logger.error("Error updating role:", error);
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      logger.info("Deleting role", { id: req.params.id });
      const role = await rolesService.deleteRoleById(req.params.id);
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
      logger.error("Error deleting role:", error);
      next(error);
    }
  },

  async updatePermissions(req, res, next) {
    try {
      logger.info("Updating permissions", { id: req.params.id });
      const role = await rolesService.updatePermissions(
        req.params.id,
        req.body
      );
      res.status(200).json(role);
    } catch (error) {
      logger.error("Error updating permissions:", error);
      next(error);
    }
  },

  async getModulePermissions(req, res, next) {
    try {
      const { id, moduleName } = req.params;
      logger.info("Fetching module permissions", { id, moduleName });
      const permissions = await rolesService.getModulePermissions(
        id,
        moduleName
      );
      res.status(200).json(Object.fromEntries(permissions));
    } catch (error) {
      logger.error("Error fetching module permissions:", error);
      next(error);
    }
  },

  /**
   * Add multiple permissions to multiple modules in a role.
   */
  async addMultiplePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const modulesPermissions = req.body; // Expecting an object with module names and permissions

      logger.info("Adding multiple permissions", {
        id,
        modulesPermissions,
      });

      const updatedRole = await rolesService.addMultiplePermissions(
        id,
        modulesPermissions
      );
      res.status(200).json(updatedRole);
    } catch (error) {
      logger.error("Error adding multiple permissions:", error);
      next(error);
    }
  },

  /**
   * Delete multiple permissions from a module in a role.
   */
  async deleteMultiplePermissions(req, res, next) {
    try {
      const { id, moduleName } = req.params;
      const { permissions } = req.body; // Expected format: ["read", "write"]
      logger.info("Deleting multiple permissions", {
        id,
        moduleName,
        permissions,
      });

      const updatedRole = await rolesService.deleteMultiplePermissions(
        id,
        moduleName,
        permissions
      );
      res.status(200).json(updatedRole);
    } catch (error) {
      logger.error("Error deleting multiple permissions:", error);
      next(error);
    }
  },

  async getSpecificPermission(req, res, next) {
    try {
      const { id, moduleName, permissionName } = req.params;
      logger.info("Fetching specific permission", {
        id,
        moduleName,
        permissionName,
      });
      const permission = await rolesService.getSpecificPermission(
        id,
        moduleName,
        permissionName
      );
      res.status(200).json(permission);
    } catch (error) {
      logger.error("Error fetching specific permission:", error);
      next(error);
    }
  },

  async addSpecificPermission(req, res, next) {
    try {
      const { id, moduleName, permissionName } = req.params;
      const { value } = req.body;
      logger.info("Adding specific permission", {
        id,
        moduleName,
        permissionName,
        value,
      });
      const updatedRole = await rolesService.addSpecificPermission(
        id,
        moduleName,
        permissionName,
        value
      );
      res.status(200).json(updatedRole);
    } catch (error) {
      logger.error("Error adding specific permission:", error);
      next(error);
    }
  },

  async updateSpecificPermission(req, res, next) {
    try {
      const { id, moduleName, permissionName } = req.params;
      const { value } = req.body;

      console.log("----------------------value is :---------",req.body);
      
      // Add explicit validation
      if (value === undefined) {
        return res.status(400).json({ 
          message: "Value is required in the request body" 
        });
      }

      logger.info("Updating specific permission", {
        id,
        moduleName,
        permissionName,
        value,
      });

      const updatedRole = await rolesService.updateSpecificPermission(
        id,
        moduleName,
        permissionName,
        value
      );

      res.status(200).json(updatedRole);
    } catch (error) {
      logger.error("Error updating specific permission:", error);
      next(error);
    }
  },

  async deleteSpecificPermission(req, res, next) {
    try {
      const { id, moduleName, permissionName } = req.params;
      logger.info("Deleting specific permission", {
        id,
        moduleName,
        permissionName,
      });
      const updatedRole = await rolesService.deleteSpecificPermission(
        id,
        moduleName,
        permissionName
      );
      res.status(200).json({
        success: true,
        message: "Permission deleted successfully",
        role: updatedRole
      });
    } catch (error) {
      logger.error("Error deleting specific permission:", error);
      next(error);
    }
  },
};

export default roleController;
