import express from "express";
import commonDataFetchController from "../controllers/commonDataFetch.controller.js";
import { authenticateToken } from "../../../core/security/utils/jwt.utils.js";

const router = express.Router();
router.use(authenticateToken);


/**
 * @swagger
 * tags:
 *   - name: CommonDataFetch
 *     description: Fetch records dynamically from multiple models
 */

/**
 * @swagger
 * /api/modules/common/model/{modelName}:
 *   get:
 *     summary: Fetch multiple records by model
 *     description: >
 *       Fetches all documents from a specified model.  
 *       Supports dynamic filters like `branchIds`, `batchIds`, `studentIds`, and `profileIds`.  
 *       You can also populate related fields by passing `populate` query param.
 *     tags: [CommonDataFetch]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Calendar, Enquiry, WorksheetsAndAssessments, PTM, Feedback, Schedule, Batch, Profile, Inventory, Expenses, Admission, ClassRoom, Payment, Attendance, Course, Subject, User]
 *         description: The model name to fetch records from
 *       - in: query
 *         name: branchIds
 *         schema:
 *           type: string
 *           example: "64f7e3b2a1234567890abcd1,64f7e3b2a1234567890abcd2"
 *         description: Comma-separated branch ObjectIds
 *       - in: query
 *         name: batchIds
 *         schema:
 *           type: string
 *           example: "64f7e3b2a1234567890abcd3"
 *         description: Comma-separated batch ObjectIds
 *       - in: query
 *         name: studentIds
 *         schema:
 *           type: string
 *           example: "64f7e3b2a1234567890abcd4"
 *         description: Comma-separated student ObjectIds
 *       - in: query
 *         name: profileIds
 *         schema:
 *           type: string
 *           example: "64f7e3b2a1234567890abcd5"
 *         description: Comma-separated profile ObjectIds
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: "branchId,studentId,facultyId"
 *         description: Comma-separated list of fields to populate
 *     responses:
 *       200:
 *         description: List of records from the given model
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *       400:
 *         description: Invalid model name
 *       500:
 *         description: Server error
 */
router.get("/model/:modelName", commonDataFetchController.getAllByModel);

/**
 * @swagger
 * /api/modules/common/model/{modelName}/{id}:
 *   get:
 *     summary: Fetch a single record by ID
 *     description: >
 *       Fetches a single document by its ID from the given model.  
 *       Optionally supports population of related fields.
 *     tags: [CommonDataFetch]
 *     parameters:
 *       - in: path
 *         name: modelName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Calendar, Enquiry, WorksheetsAndAssessments, PTM, Feedback, Schedule, Batch, Profile, Inventory, Expenses, Admission, ClassRoom, Payment, Attendance, Course, Subject, User]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The ID of the record to fetch
 *       - in: query
 *         name: populate
 *         schema:
 *           type: string
 *           example: "branchId,studentId"
 *         description: Comma-separated list of fields to populate
 *     responses:
 *       200:
 *         description: Record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400:
 *         description: Invalid model name
 *       404:
 *         description: Record not found
 *       500:
 *         description: Server error
 */
router.get("/model/:modelName/:id", commonDataFetchController.getByIdAndModel);
router.patch("/model/:modelName/:id", commonDataFetchController.getByIdAndModelAndUpdatePartial);

export default { path: "/api/modules/common", router };
