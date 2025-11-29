import express from "express";
import profileController from "../controllers/profile.controller.js";
import { authenticateToken } from "../../../core/security/utils/jwt.utils.js";

const router = express.Router();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   - name: Modules - Profiles
 *     description: Operations related to profile management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - type
 *         - userId
 *         - firstName
 *         - lastName
 *         - primaryNumber
 *         - primaryEmail
 *       properties:
 *         type:
 *           type: string
 *           description: Type of the profile (role category)
 *           enum:
 *             - superadmin
 *             - owner
 *             - accountant
 *             - manager
 *             - admin
 *             - parent
 *             - student
 *             - guardian
 *             - faculty
 *             - staff
 *             - receptionist
 *             - others
 *           example: student
 *         userId:
 *           type: string
 *           format: ObjectId
 *           description: Reference to the User document
 *           example: 605c72f8e3a1a23b4c8d5678
 *         branchId:
 *           type: array
 *           description: Array of Branch IDs associated with this profile
 *           items:
 *             type: string
 *             format: ObjectId
 *           example:
 *             - 67ea2e6fc428a829a89a5597
 *         relationId:
 *           type: array
 *           description: Array of related Profile IDs
 *           items:
 *             type: string
 *             format: ObjectId
 *         relation:
 *           type: array
 *           description: Nature of relations (if applicable)
 *           items:
 *             type: string
 *           example: ["father", "mother"]
 *         gender:
 *           type: string
 *           example: Male
 *         firstName:
 *           type: string
 *           example: John
 *         middleName:
 *           type: string
 *           example: A.
 *         lastName:
 *           type: string
 *           example: Doe
 *         doB:
 *           type: string
 *           format: date
 *           example: 1998-06-15
 *         aadharNumber:
 *           type: string
 *           example: 123456789012
 *         primaryNumber:
 *           type: string
 *           example: "+91-9876543210"
 *         secondaryNumber:
 *           type: string
 *         primaryEmail:
 *           type: string
 *           format: email
 *           example: johndoe@example.com
 *         secondaryEmail:
 *           type: string
 *           format: email
 *         occupation:
 *           type: string
 *           example: Teacher
 *         presentAddress:
 *           type: object
 *           example:
 *             street: "123 Main St"
 *             city: "Pune"
 *             state: "MH"
 *         pincode:
 *           type: number
 *           example: 411001
 *         permanentAddress:
 *           type: object
 *         location:
 *           type: array
 *           items:
 *             type: string
 *           example: ["14.52N", "56.231E"]
 *         documentId:
 *           type: array
 *           items:
 *             type: string
 *             format: ObjectId
 *         highestQualification:
 *           type: string
 *           example: MSc Physics
 *         skills:
 *           type: object
 *           example:
 *             teaching: true
 *             programming: ["JavaScript", "Python"]
 *         referenceId:
 *           type: string
 *           format: ObjectId
 *         salary:
 *           type: number
 *           example: 50000
 *         version:
 *           type: number
 *           default: 1
 */

/**
 * @swagger
 * /api/modules/profiles:
 *   get:
 *     summary: Get all profiles
 *     tags: [Modules - Profiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of profiles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server Error
 */

router.get("/", profileController.getAll);



/**
 * @swagger
 * /api/modules/profiles/type:
 *   get:
 *     summary: Get profiles by allowed types
 *     tags: [Modules - Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: allowedTypes
 *         schema:
 *           type: string
 *         required: true
 *         description: Comma-separated list of profile types to filter
 *         example: manager,faculty,student
 *     responses:
 *       200:
 *         description: Filtered list of profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid or missing allowedTypes parameter
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/type", profileController.getAllByType);

/**
 * @swagger
 * /api/modules/profiles/{id}:
 *   get:
 *     summary: Get a profile by ID
 *     tags: [Modules - Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the profile to retrieve
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Profile found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", profileController.getById);

/**
 * @swagger
 * /api/modules/profiles:
 *   post:
 *     summary: Create a new profile
 *     tags: [Modules - Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *           example:
 *             type: student
 *             userId: 605c72f8e3a1a23b4c8d5678
 *             firstName: John
 *             lastName: Doe
 *             primaryNumber: "+91-9876543210"
 *             primaryEmail: johndoe@example.com
 *             branchId: ["67ea2e6fc428a829a89a5597"]
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Server Error
 */
router.post("/", profileController.create);

/**
 * @swagger
 * /api/modules/profiles/{id}:
 *   put:
 *     summary: Update a profile by ID
 *     tags: [Modules - Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the profile to update
 *         schema:
 *           type: string
 *           format: ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Profile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       422:
 *         description: Validation failed
 *       500:
 *         description: Internal server error
 */
router.put("/:id", profileController.update);


router.patch("/:id", profileController.patch);
/**
 * @swagger
 * /api/modules/profiles/{id}:
 *   delete:
 *     summary: Delete a profile by ID
 *     tags: [Modules - Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ObjectId of the profile to delete
 *         schema:
 *           type: string
 *           format: ObjectId
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", profileController.delete);

router.get("/all/role-ids", profileController.getAllByRoleIds);

export default { path: "/api/modules/profiles", router };
