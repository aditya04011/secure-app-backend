import express from "express";
import roleController from "../controllers/roles.controller.js";
import { authenticateToken } from "../utils/jwt.utils.js";

const router = express.Router();
router.use(authenticateToken);

// Existing base routes
/**
 * @swagger
 * tags:
 *   name: Core - Security / Roles
 *   description: API for managing roles and permissions
 */

/**
 * @swagger
 * /api/core/security/roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role with the necessary permissions.
 *     tags: [Core - Security / Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The name of the role.
 *                 example: faculty
 *               permissions:
 *                 type: object
 *                 additionalProperties:
 *                   type: object
 *                   properties:
 *                     New:
 *                       type: boolean
 *                       description: Permission to create new items.
 *                       example: true
 *                     Edit:
 *                       type: boolean
 *                       description: Permission to edit existing items.
 *                       example: true
 *                     Delete:
 *                       type: boolean
 *                       description: Permission to delete items.
 *                       example: false
 *                     Show:
 *                       type: boolean
 *                       description: Permission to view items.
 *                       example: true
 *                 description: Permissions for the role, mapped by module names.
 *                 example:
 *                   configuration:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   notifications:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   search:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   security:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   administration:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   admissions:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   assessments:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   attendance:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   batches:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   branches:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   classrooms:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   courses:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   enquiries:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   feedback:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   fees:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   monitoring:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   reports:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   schedules:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   schools:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   students:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   subjects:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *                   taskmanagement:
 *                     New: true
 *                     Edit: true
 *                     Delete: false
 *                     Show: true
 *               version:
 *                 type: integer
 *                 description: The version of the role document.
 *                 example: 1
 *     responses:
 *       201:
 *         description: Role created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roleName:
 *                   type: string
 *                   example: faculty
 *                 permissions:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       New:
 *                         type: boolean
 *                       Edit:
 *                         type: boolean
 *                       Delete:
 *                         type: boolean
 *                       Show:
 *                         type: boolean
 *                 version:
 *                   type: integer
 *                   example: 1
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-18T04:32:58.437Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-01-21T04:05:05.338Z"
 *       400:
 *         description: Invalid input.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid input data
 */

router.post("/", roleController.create);

/**
 * @swagger
 * /api/core/security/roles:
 *   get:
 *     summary: Get all roles
 *     description: Get a list of all roles in the system
 *     tags: [Core - Security / Roles]
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The role ID
 *                   name:
 *                     type: string
 *                     description: Name of the role
 *                   description:
 *                     type: string
 *                     description: Description of the role
 */
router.get("/", roleController.getAll);

/**
 * @swagger
 * /api/core/security/roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     description: Retrieve the details of a specific role by its ID
 *     tags: [Core - Security / Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The role ID
 *                 name:
 *                   type: string
 *                   description: Name of the role
 *                 description:
 *                   type: string
 *                   description: Description of the role
 *       404:
 *         description: Role not found
 */
router.get("/:id", roleController.getById);

/**
 * @swagger
 * /api/core/security/roles/{id}:
 *   put:
 *     summary: Update a role by ID
 *     description: Update the details of a specific role by its ID
 *     tags: [Core - Security / Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The name of the role (e.g., "teacher").
 *               permissions:
 *                 type: object
 *                 properties:
 *                   configuration:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   notifications:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   search:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   security:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   administration:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   admissions:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   assessments:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   attendance:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   batches:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   branches:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   classrooms:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   courses:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   enquiries:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   feedback:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   fees:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   monitoring:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   reports:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   schedules:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   schools:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   students:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   subjects:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *                   taskmanagement:
 *                     type: object
 *                     properties:
 *                       New: { type: boolean }
 *                       Edit: { type: boolean }
 *                       Delete: { type: boolean }
 *                       Show: { type: boolean }
 *               version:
 *                 type: number
 *                 description: Version of the role.
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: The creation timestamp of the role.
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: The last updated timestamp of the role.
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", roleController.update);

/**
 * @swagger
 * /api/core/security/roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     description: Delete a specific role by its ID
 *     tags: [Core - Security / Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to delete.
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 */
router.delete("/:id", roleController.delete);
// Module permissions routes

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions/{moduleName}:
 *   get:
 *     summary: Get permissions for a specific module
 *     description: Retrieve the permissions for a specific module within a role.
 *     tags: [Core - Security / Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role.
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module.
 *     responses:
 *       200:
 *         description: Module permissions retrieved successfully.
 *       404:
 *         description: Role or module not found.
 */
router.get("/:id/permissions/:moduleName", roleController.getModulePermissions);

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions/{moduleName}:
 *   delete:
 *     summary: Delete multiple permissions for a specific module in a role
 *     description: Deletes specified permissions for a specific module within a role.
 *     tags:
 *       - Core - Security / Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the role.
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module for which permissions are to be deleted.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["New", "Edit",""]
 *                 description: List of permissions to delete from the module.
 *     responses:
 *       200:
 *         description: Permissions deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Permissions deleted successfully.
 *                 updatedRole:
 *                   type: object
 *                   description: Updated role details after deletion.
 *       400:
 *         description: Bad request. Validation error or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid permissions format. Expected an array of strings.
 *       404:
 *         description: Role or module not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role or module not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An unexpected error occurred.
 */

router.delete(
  "/:id/permissions/:moduleName",
  roleController.deleteMultiplePermissions
);
/**
 * @swagger
 * /api/core/security/roles/{id}/permissions:
 *   post:
 *     summary: Add or update permissions for all modules in a role
 *     description: This endpoint allows adding or updating permissions for all modules within a role. Each module has permissions like New, Edit, Delete, and Show.
 *     tags: [Core - Security / Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the role to which permissions will be added or updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: A map of module names to their respective permission configurations.
 *             additionalProperties:
 *               type: object
 *               properties:
 *                 New:
 *                   type: boolean
 *                   description: Permission to create new entries.
 *                 Edit:
 *                   type: boolean
 *                   description: Permission to edit existing entries.
 *                 Delete:
 *                   type: boolean
 *                   description: Permission to delete entries.
 *                 Show:
 *                   type: boolean
 *                   description: Permission to view entries.
 *             example:
 *               configuration:
 *                 New: false
 *                 Edit: false
 *                 Delete: false
 *                 Show: false
 *               notifications:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               search:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               security:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               administration:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               admissions:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               assessments:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               attendance:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               batches:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               branches:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               classrooms:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               courses:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               enquiries:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               feedback:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               fees:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               monitoring:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               reports:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               schedules:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               schools:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               students:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *               subjects:
 *                 New: false
 *                 Edit: false
 *                 Delete: true
 *                 Show: true
 *               taskmanagement:
 *                 New: true
 *                 Edit: true
 *                 Delete: true
 *                 Show: true
 *     responses:
 *       200:
 *         description: Permissions added or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique identifier of the role.
 *                 roleName:
 *                   type: string
 *                   description: The name of the role.
 *                 permissions:
 *                   type: object
 *                   description: Updated permissions for the role.
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       New:
 *                         type: boolean
 *                         description: Permission to create new entries.
 *                       Edit:
 *                         type: boolean
 *                         description: Permission to edit existing entries.
 *                       Delete:
 *                         type: boolean
 *                         description: Permission to delete entries.
 *                       Show:
 *                         type: boolean
 *                         description: Permission to view entries.
 *                 version:
 *                   type: integer
 *                   description: The version number of the role document.
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of when the role was created.
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of when the role was last updated.
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A detailed message explaining the validation error.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating an internal issue.
 */

router.post("/:id/permissions", roleController.addMultiplePermissions);

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions:
 *   put:
 *     summary: Update permissions for a role
 *     description: Update multiple permissions for modules within a role.
 *     tags: [Core - Security / Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: object
 *               properties:
 *                 New:
 *                   type: boolean
 *                   description: Permission to create new entries.
 *                 Edit:
 *                   type: boolean
 *                   description: Permission to edit existing entries.
 *                 Delete:
 *                   type: boolean
 *                   description: Permission to delete entries.
 *                 Show:
 *                   type: boolean
 *                   description: Permission to view entries.
 *             example:
 *               moduleName: 
 *                 New: true
 *                 Edit: false
 *                 Delete: true
 *                 Show: true
 *     responses:
 *       200:
 *         description: Permissions updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Permissions updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the role.
 *                     permissions:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           New: { type: boolean }
 *                           Edit: { type: boolean }
 *                           Delete: { type: boolean }
 *                           Show: { type: boolean }
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input data."
 */
router.put("/:id/permissions", roleController.updatePermissions);



// Specific permission routes

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions/{moduleName}/{permissionName}:
 *   get:
 *     summary: Get specific permission for a module
 *     description: Retrieve a specific permission for a module within a role.
 *     tags: 
 *       - Core - Security / Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role.
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module.
 *       - in: path
 *         name: permissionName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the permission (e.g., "New", "Edit").
 *     responses:
 *       200:
 *         description: Permission retrieved successfully.
 *       404:
 *         description: Role, module, or permission not found.
 */
router.get(
  "/:id/permissions/:moduleName/:permissionName",
  roleController.getSpecificPermission
);

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions/{moduleName}/{permissionName}:
 *   post:
 *     summary: Add a specific permission for a module within a role
 *     description: Adds a specific permission (e.g., "New", "Edit") for a module associated with a role.
 *     tags: 
 *       - Core - Security / Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role.
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module.
 *       - in: path
 *         name: permissionName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the permission to add (e.g., "New", "Edit").
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: boolean
 *                 description: The value for the permission (true or false).
 *                 example: true
 *     responses:
 *       200:
 *         description: Permission added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the updated role.
 *                   example: "63f6e9d12345abc67890defg"
 *                 permissions:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       New:
 *                         type: boolean
 *                         example: true
 *                       Edit:
 *                         type: boolean
 *                         example: false
 *       400:
 *         description: Invalid input data.
 *       404:
 *         description: Role, module, or permission not found.
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/:id/permissions/:moduleName/:permissionName",
  roleController.addSpecificPermission
);

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions/{moduleName}/{permissionName}:
 *   put:
 *     summary: Update a specific permission of a role
 *     description: Updates a permission of a specific role for a given module
 *     operationId: updateSpecificPermission
 *     tags: 
 *       - Core - Security / Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role to update
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module
 *       - in: path
 *         name: permissionName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the permission to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: boolean
 *                 description: The new value for the permission
 *                 example: true
 *     responses:
 *       200:
 *         description: Successfully updated the specific permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 permissions:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *       400:
 *         description: Bad request. Invalid input data or missing parameters
 *       404:
 *         description: Role, module, or permission not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:id/permissions/:moduleName/:permissionName",
  roleController.updateSpecificPermission
);

/**
 * @swagger
 * /api/core/security/roles/{id}/permissions/{moduleName}/{permissionName}:
 *   delete:
 *     summary: Delete a specific permission for a module
 *     description: Delete a specific permission (e.g., "New", "Edit") for a module within a role.
 *     tags:
*       - Core - Security / Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the role.
 *       - in: path
 *         name: moduleName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the module.
 *       - in: path
 *         name: permissionName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the permission (e.g., "New", "Edit").
 *     responses:
 *       200:
 *         description: Permission deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Permission deleted successfully."
 *       404:
 *         description: Role, module, or permission not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Role, module, or permission not found."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error deleting specific permission."
 */
router.delete(
  "/:id/permissions/:moduleName/:permissionName",
  roleController. deleteSpecificPermission
);

export default {
  path: "/api/core/security/roles",
  router,
};
