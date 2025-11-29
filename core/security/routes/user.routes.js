import express from "express";
import { userController } from "../controllers/user.controller.js";
import { authenticateToken } from "../utils/jwt.utils.js";

const router = express.Router();

// Protect all user routes
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   - name: Core - Security / Users
 *     description: User management operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BranchRole:
 *       type: object
 *       required:
 *         - branchId
 *         - roleId
 *       properties:
 *         branchId:
 *           type: string
 *           format: ObjectId
 *           description: Reference ID of the Branch
 *           example: 605c72f8e3a1a23b4c8d5678
 *         roleId:
 *           type: string
 *           format: ObjectId
 *           description: Reference ID of the Role
 *           example: 605c72f8e3a1a23b4c8d1234
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - roles
 *       properties:
 *         username:
 *           type: string
 *           description: Unique username
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: Unique email address
 *           example: johndoe@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: User password (hashed)
 *         roles:
 *           type: array
 *           description: List of branch-role assignments
 *           items:
 *             $ref: '#/components/schemas/BranchRole'
 *         isActive:
 *           type: boolean
 *           default: true
 *         version:
 *           type: number
 *           default: 1
 *         passwordChangedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-08-14T10:15:30Z
 *         tokenVersion:
 *           type: number
 *           default: 1
 */

/**
 * @swagger
 * /api/core/security/users:
 *   get:
 *     summary: Get all users
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */

router.get("/", userController.getAll);

/**
 * @swagger
 * /api/core/security/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Fetch a user based on their unique MongoDB ObjectId.
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the user to retrieve
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: 605c72f8e3a1a23b4c8d1234
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get("/:id", userController.getById);

/**
 * @swagger
 * /api/core/security/users/email/{email}:
 *   get:
 *     summary: Get a user by email
 *     description: Fetch a user based on their email address.
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         description: The email address of the user to retrieve
 *         schema:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

router.get("/email/:email", userController.getByEmail);

/**
 * @swagger
 * /api/core/security/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username for the user
 *                 example: priyaranjan
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user
 *                 example: priyaranjan@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the user (will be hashed)
 *                 example: Welcome1$
 *               roles:
 *                 type: array
 *                 description: Array of branch-role assignments
 *                 items:
 *                   $ref: '#/components/schemas/BranchRole'
 *             required:
 *               - email
 *               - password
 *               - roles
 *           example:
 *             username: priyaranjan
 *             email: priyaranjan@gmail.com
 *             password: Welcome1$
 *             roles:
 *               - branchId: 67ea2e6fc428a829a89a5597
 *                 roleId: 605c72f8e3a1a23b4c8d1234
 *               - branchId: 605c72f8e3a1a23b4c8d5678
 *                 roleId: 605c72f8e3a1a23b4c8d9876
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Server Error
 */

router.post("/", userController.create);
/**
 * @swagger
 * /api/core/security/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Updates the user data by their MongoDB ObjectId, including roles if applicable.
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the user to update
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: 605c72f8e3a1a23b4c8d1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated username for the user
 *                 example: priyaranjan
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address
 *                 example: priyaranjan@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Updated password (will be hashed)
 *                 example: Welcome1$
 *               roles:
 *                 type: array
 *                 description: Updated list of branch-role assignments
 *                 items:
 *                   $ref: '#/components/schemas/BranchRole'
 *             required:
 *               - email
 *               - roles
 *           example:
 *             username: priyaranjan
 *             email: priyaranjan@gmail.com
 *             password: Welcome1$
 *             roles:
 *               - branchId: 67ea2e6fc428a829a89a5597
 *                 roleId: 605c72f8e3a1a23b4c8d1234
 *               - branchId: 605c72f8e3a1a23b4c8d5678
 *                 roleId: 605c72f8e3a1a23b4c8d9876
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized access
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put("/:id", userController.updateById);

/**
 * @swagger
 * /api/core/security/users/{id}:
 *   delete:
 *     summary: Soft delete a user by ID
 *     description: Marks the user as inactive instead of permanently removing them from the database.
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the user to delete
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: 605c72f8e3a1a23b4c8d1234
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", userController.deleteById);

/**
 * @swagger
 * /api/core/security/users/{id}/change-password:
 *   put:
 *     summary: Change password for a user
 *     description: Updates the user's password after verifying the old password.
 *     tags: [Core - Security / Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the user whose password will be changed
 *         schema:
 *           type: string
 *           format: ObjectId
 *           example: 605c72f8e3a1a23b4c8d1234
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password of the user
 *                 example: OldPass123$
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password to be set
 *                 example: NewPass456$
 *             required:
 *               - oldPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put("/:id/change-password", userController.changePassword);
router.put("/status/:id", userController.updateStatus);

router.delete("/delete-permanently/:id", userController.deleteByIdPermanently);
export default {
  path: "/api/core/security/users",
  router,
};
