import loggingService from "../../../services/logging.service.js";
const logger = loggingService.getModuleLogger("Modules-Common","CommonDataFetchService");
import { createError } from "../../../services/errorhandling.service.js";
import { getFeedbackSchemaForVersion } from "../../feedback/services/feedback.service.js";

/* Allowed populate fields to populate data from specific model. */

const allowedPopulateFields = {
  Calendar: ["branchIds"],
  Enquiry: [
    "studentId",
    "createdBy",
    "assignedTo",
    "branchId",
    "courseId",
    "subjects",
    "taskIds",
  ],
  WorksheetsAndAssessments: [
    "subject",
    "facultyId",
    "batchId",
    "branchId",
    "documentIds",
  ],
  PTM: ["studentIds", "coordinatorId", "branchId", "feedbackId", "scheduleId"],
  Feedback: [
    "referenceId",
    "givenById",
    "createdBy",
    "reviewedBy",
    "taskIds",
    "branchId",
    "referenceId",
    "assignedTo",
  ],
  Schedule: [
    "subjectId",
    "facultyId",
    "batchId",
    "branchId",
    "classRoomsId",
    "taskIds",
    "worksheetsAndAssessmentsId",
    "ptmId",
    "documentIds",
  ],
  Batch: ["courseId", "students", "coordinator", "classRoom", "branchId"],
  Profile: ["branchId", "documentId", "relationId","userId"],
  Inventory: ["branchId", "documentIds", "allocations.facultyId"],
  Expenses: [
    "branchId",
    "reportedBy",
    "reportedTo",
    "productId",
    "documentIds",
    "salaryCreditedTo",
  ],
  Admission: ["courseId", "batchId", "studentId", "branchId", "schoolId"],
  ClassRoom: ["branchId", "batchId", "coordinator"],
  Payment: ["branchId", "studentId", "invoiceId"],
  Attendance: ["referenceId", "scheduleId"],
  Leaves: ["userId", "approver"],
};

function getDateRangeQuery(field, dateInput = new Date(), useUTC = true) {
  const date = new Date(dateInput);

  let startOfDay, endOfDay;

  if (useUTC) {
    startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  } else {
    startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  }

  return {
    [field]: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  };
}
const wrapWithDate = (queryFn, dateField = null) => (params) => {
  const baseQuery = queryFn(params);
  if (!dateField) return baseQuery; // no date filter

  return {
    ...baseQuery,
    ...getDateRangeQuery(dateField, params.fetchDate, true),
  };
};

// Utility: Generate query based on model and filters
const queryConfig = {
  Announcement: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchIds: { $in: branchIds } }),
    },
  ],
  Book: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({}),
    },
  ],
  Enquiry: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds, stage }) => ({ branchId: { $in: branchIds }, 
          ...(stage?.isEnquiry !== undefined ? { "stage.isEnquiry": stage.isEnquiry } : {}),
          ...(stage?.isLead !== undefined ? { "stage.isLead": stage.isLead } : {})
      }),
    },
    {
      condition: ({ profileType }) =>
        profileType === "student" || profileType === "parent/guardian",
      query: ({ studentId, studentIds }) => {
        if (studentId) return { studentId }; // single student
        if (studentIds) return { studentId: { $in: studentIds } }; // multiple students
        return {};
      },
    },
  ],
  ClassRoom: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      condition: ({ fetchType }) => fetchType === "batchIds",
      query: ({ batchIds }) => ({ batchId: { $in: batchIds } }),
    },
  ],
  Calendar: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchIds: { $in: branchIds } }),
    },
  ],
  FeeStructure: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({}),
    },
  ],
  Payment: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      condition: ({ fetchType }) => fetchType === "studentIds",
      query: ({ studentIds }) => ({ studentId: { $in: studentIds } }),
    },
  ],
  WorksheetsAndAssessments: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      condition: ({ fetchType }) => fetchType === "batchIds",
      query: ({ batchIds }) => ({ batchId: { $in: batchIds } }),
    },
    {
      condition: ({ profileType }) =>
        ["student", "batchId"].includes(profileType),
      query: ({ batchId }) => ({ batchId }),
    },
    {
      condition: ({ profileType }) =>
        ["manager", "faculty", "admin", "owner"].includes(profileType),
      query: ({ facultyId }) => ({ facultyId }),
    },
  ],
  Schedule: [
    {
      condition: ({ fetchType, isInclude }) =>
        fetchType === "branchIds" && isInclude,
      query: ({ branchIds }) => ({
        branchId: { $in: branchIds },
      }),
    },
     {
      condition: ({ fetchType, fetchDate }) =>
        fetchType === "batchIds" && !fetchDate,
      query: ({ batchIds }) => ({
        batchId: { $in: batchIds },
      }),
    },
    {
      condition: ({ profileType }) => ["student"].includes(profileType),
      query: wrapWithDate(({ batchId }) => ({ batchId }), "date"),
    },
    {
      condition: ({ profileType }) =>
        ["manager", "faculty", "admin", "owner"].includes(profileType),
      query: ({ facultyId }) => ({ facultyId }),
    },
    {
      condition: ({ fetchType, fetchDate }) => fetchType === "batchIds" && fetchDate,
      query: wrapWithDate(
        ({ batchIds }) => ({
          batchId: { $in: batchIds },
        }),
        "date"
      ),
    },
    {
      condition: ({ fetchType }) => fetchType === "subjectIds",
      query: wrapWithDate(
        ({ subjectIds }) => ({
          subjectId: { $in: subjectIds },
        }),
        "date"
      ),
    },
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: wrapWithDate(
        ({ branchIds }) => ({
          branchId: { $in: branchIds },
        }),
        "date"
      ),
    },
  ],
  Course: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
  ],
  Subject: [
    {
      condition: ({ profileType }) => profileType === "student",
      query: ({ board, standard }) => ({ board, standard }),
    },
  ],
  Attendance: [
    {
      condition: ({ profileId }) => !!profileId,
      query: ({ profileId }) => ({ referenceId: profileId }),
    },
    {
      condition: ({ fetchType, fetchDate }) =>
        fetchType === "profileIds" && fetchDate,
      query: wrapWithDate(
        ({ profileIds }) => ({ referenceId: { $in: profileIds } }),
        "createdAt"
      ),
    },
  ],
  Batch: [
    {
      condition: ({ fetchType }) => fetchType === "studentIds",
      query: ({ studentIds }) => ({ students: { $in: studentIds } }),
    },
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds, isActive = true, isInclude }) => ({
        branchId: { $in: branchIds },
        ...(!isInclude && { isActive }),
      }),
    },
  ],
  Admission: [
    {
      condition: ({ fetchType }) => fetchType === "studentIds",
      query: ({ studentIds }) => ({ studentId: { $in: studentIds } }),
    },
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
  ],
  Project: [
    { condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
  ],
  Profile: [
    {
      condition: ({ fetchType }) => fetchType === "profileIds",
      query: ({ profileIds }) => ({ _id: { $in: profileIds } }),
    },
    {
      condition: ({ fetchType }) =>
        fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      condition: ({ fetchType, profileType }) =>
        fetchType === "branchIds" && profileType,
      query: ({ branchIds, profileType }) => ({
        branchId: { $in: branchIds },
        type: { $in: [profileType] },
      }),
    },
  ],
  PTM: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      condition: ({ profileType }) => profileType === "student",
      query: ({ profileId }) => ({
        studentIds: { $in: [profileId] },
      }),
    },
    // { condition: ({ profileType }) => profileType === 'student', query: ({ profileId }) => ({ studentIds: { $in: [profileId] } }) },
    {
      condition: ({ profileType }) =>
        ["manager", "faculty", "admin"].includes(profileType),
      query: ({ facultyId }) => ({ coordinatorId: facultyId }),
    },
  ],
  Leaves: [
    {
      condition: ({ fetchType }) => fetchType === "userId",
      query: ({ userIds }) => ({ userId: { $in: userIds } }),
    },
    {
      condition: ({ userIds, approver }) =>
        !!userIds?.length > 0 || !!approver?.length > 0,

      query: ({ approver, userIds }) => {
        const orConditions = [];

        if (userIds?.length > 0)
          orConditions.push({ userId: { $in: userIds } });
        if (approver?.length > 0)
          orConditions.push({ approver: { $in: approver } });

        // If none are valid, return null to avoid { $or: [] }
        if (orConditions.length === 0) return null;

        return { $or: orConditions };
      },
    },
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchIds: { $in: branchIds } }),
    },
  ],
  Feedback: [
    {
      condition: ({ fetchType }) => fetchType === "aboutId",
      query: ({ aboutId }) => ({ aboutId }),
    },
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      condition: ({
        givenById,
        assignedTo,
        reviewedBy,
        referenceId,
        createdBy,
      }) =>
        !!givenById ||
        !!assignedTo ||
        !!reviewedBy ||
        !!referenceId ||
        !createdBy, // only proceed if at least one exists

      query: ({
        givenById,
        assignedTo,
        reviewedBy,
        referenceId,
        createdBy,
      }) => {
        const orConditions = [];

        if (givenById) orConditions.push({ givenById });
        if (assignedTo) orConditions.push({ assignedTo });
        if (reviewedBy) orConditions.push({ reviewedBy });
        if (referenceId) orConditions.push({ referenceId });
        if (createdBy) orConditions.push({ createdBy });

        // If none are valid, return null to avoid { $or: [] }
        if (orConditions.length === 0) return null;

        return { $or: orConditions };
      },
    },
  ],
  Inventory: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
  ],
  Expenses: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({ branchId: { $in: branchIds } }),
    },
    {
      // case 2: branchIds + productId together
      condition: ({ fetchType }) => fetchType === "branchIdsAndProductId",
      query: ({ branchIds, productId }) => ({
        branchId: { $in: branchIds },
        productId: productId,
      }),
    },
  ],
  User: [
    {
      condition: ({ fetchType }) => fetchType === "branchIds",
      query: ({ branchIds }) => ({
        roles: {
          $elemMatch: {
            branchId: { $in: branchIds },
          },
        },
      }),
    },
    {
      condition: ({ fetchType }) => fetchType === "userIds",
      query: ({ userIds }) => ({ _id: { $in: userIds } }),
    },
    {
      condition: ({ fetchType }) => fetchType === "roleIds",
      query: ({ roleIds }) => ({ "roles.roleId": { $in: roleIds } }),
    }

  ],
};

const buildQuery = (modelName, filters) => {
  const rules = queryConfig[modelName];

  if (!rules) {
    return { _id: null }; // Return impossible query to fetch 0 documents
  }

  const matchedRule = rules.find(rule => rule.condition(filters));
  logger.warn("matched rule", { matchedRule: matchedRule });

  let query = {};

  // If a matched rule exists, generate the base query
  if (matchedRule) {
    query = matchedRule.query(filters);
  } else {
    return { _id: null }; // No match: return impossible query for 0 documents
  }

  // If `academicYear` is provided in filters, add it to the query
  if (filters.academicYear) {
    query.academicYear = filters.academicYear;
  }

  return query;
};


const parseToArray = (value) => (typeof value === 'string' ? value.split(',') : value);

/* Fetches all documents from a specified Mongoose model based on dynamic filters and optionally populates related fields. */
export const getAllDataByModel = async (req, res, models) => {
  const { modelName } = req.params;
  let rawQuery = req.query;

  logger.info(`Fetching related records for model: ${modelName}`, { res: req.query });

  const Model = models[modelName];
  
  if (!Model) {
    logger.warn("Invalid model name");
    return res.status(400).json({ error: 'Invalid model name' });
  }

  try {
    logger.debug("building query...");
    const query = buildQuery(modelName, {
      ...rawQuery,
      studentIds: parseToArray(rawQuery.studentIds),
      branchIds: parseToArray(rawQuery.branchIds),
      batchIds: parseToArray(rawQuery.batchIds),
      profileIds: parseToArray(rawQuery.profileIds),
      userIds: parseToArray(rawQuery.userIds),
      subjectIds: parseToArray(rawQuery.subjectIds),
      roleIds: parseToArray(rawQuery.roleIds),
      stage: rawQuery.stage ? JSON.parse(rawQuery.stage) : null,
    });

    logger.debug("Generated query:", { query });
    // if (!query || Object.keys(query).length === 0) {
    //   logger.info(`No valid query built for model: ${modelName}. Returning empty result.`);
    //   return []; // 👈 Return empty list safely
    // }
    // Start the mongoose query
    let mongooseQuery = Model.find(query);

    // Handle populate if provided
    if (rawQuery.populate && allowedPopulateFields[modelName]) {
      const requestedFields = rawQuery.populate.split(",").map((f) => f.trim());

      // allow only fields present in allowedPopulateFields
      const safeFields = requestedFields.filter((f) => {
        // allow both simple fields and nested ones (check parent)
        const [parent] = f.split(".");
        return (
          allowedPopulateFields[modelName].includes(parent) ||
          allowedPopulateFields[modelName].includes(f)
        );
      });

      for (const field of safeFields) {
        if (field.includes(".")) {
          // Handle nested populate e.g. "studentId.relationId"
          const parts = field.split(".");
          let populateConfig = { path: parts[0] };

          // Build nested populate object recursively
          let current = populateConfig;
          for (let i = 1; i < parts.length; i++) {
            current.populate = { path: parts[i] };
            current = current.populate;
          }

          mongooseQuery = mongooseQuery.populate(populateConfig);
        } else {
          // Simple populate
          mongooseQuery = mongooseQuery.populate(field);
        }
      }
    }

    const items = await mongooseQuery;

    logger.info(`Retrieved ${items.length} records from ${modelName}`);
    return items;
  } catch (err) {
    logger.error(`Error fetching ${modelName}`, err);
    throw createError(500, "Failed to fetch records");
  }
};

/* Fetches document from a specified Mongoose model based on Id. */

export const getDataByIdAndModel = async (req, res, models) => {
  const { modelName, id } = req.params;
  const { populate } = req.query;

  logger.info(`Fetching a single record from model: ${modelName} by ID: ${id}`);
 logger.debug(`Fetching related records for model: ${modelName}`, { res: req.query });
  const Model = models[modelName];
  if (!Model) {
    logger.warn("Invalid model name");
    throw new Error("Invalid model name");
  }

  try {
    let query = Model.findById(id);

    // Apply population if requested
    if (populate) {
      const populateFields = populate.split(",").map((field) => field.trim());
      // populateFields.forEach(field => {
      //   query = query.populate(field);
      // });
      populateFields.forEach((field) => {
        if (field.includes(".")) {
          // Handle nested populate e.g. "studentId.relationId"
          const [path, subPath] = field.split(".");
          query = query.populate({
            path,
            populate: { path: subPath },
          });
        } else {
          // Simple populate
          query = query.populate(field);
        }
      });
    }
    const item = await query.lean(); // Convert to plain JS object
    if (!item) {
      logger.warn(`${modelName} not found with ID: ${id}`);
      return null;
    }

    logger.info(`Successfully fetched record of ${modelName}.`);
    return item;
  } catch (err) {
    logger.error(`Error fetching ${modelName} by ID`, err);
    throw err;
  }
};


/**
 * Generic partial update for any model
 * Validates only the fields present in `data`.
 */
export const partialUpdateByIdAndModel = async (
  modelName,
  id,
  data,
  models
) => {
  const Model = models[modelName];
  if (!Model) throw createError(400, "Invalid model name");

  try {
    logger.info(`Partial update request for ${modelName} ID: ${id}`);

    let schema = null;
    const version = data.version || 1;

    // Load schema dynamically if needed
    if (modelName === "Feedback") {
      schema = getFeedbackSchemaForVersion(version);
      if (!schema) {
        logger.warn(`Invalid version provided for ${modelName} partial update`);
        throw createError(400, "Invalid version provided");
      }
    }

    // --- STEP 1: Preprocess append/set for validation ---
    const dataCopy = { ...data };
    for (const [key, value] of Object.entries(dataCopy)) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        (value.append || value.set)
      ) {
        // Flatten for validation
        dataCopy[key] = value.set || value.append || [];
      }
    }

    // --- STEP 2: Joi validation if schema exists ---
    if (schema) {
      const partialSchema = schema.fork(
        Object.keys(schema.describe().keys),
        (field) => field.optional()
      );

      const { error, value: validatedData } = partialSchema.validate(dataCopy, {
        presence: "optional",
        stripUnknown: true,
      });

      if (error) {
        logger.warn(
          `Validation failed for ${modelName}: ${error.details[0].message}`
        );
        throw createError(422, error.details[0].message);
      }

      // Replace with validated values
      Object.assign(dataCopy, validatedData);
    }

    // --- STEP 3: Remove undefined/null ---
    const cleanData = Object.fromEntries(
      Object.entries(dataCopy).filter(([_, v]) => v !== undefined)
    );

    // --- STEP 4: Build updateObject dynamically ---
    const updateObject = {};

    for (const [field, fieldValue] of Object.entries(data)) {
      if (
        fieldValue &&
        typeof fieldValue === "object" &&
        !Array.isArray(fieldValue) &&
        fieldValue.append
      ) {
        // Append case
        updateObject["$addToSet"] = updateObject["$addToSet"] || {};
        updateObject["$addToSet"][field] = { $each: fieldValue.append };
      } else if (
        fieldValue &&
        typeof fieldValue === "object" &&
        !Array.isArray(fieldValue) &&
        fieldValue.set !== undefined
      ) {
        // Set case
        updateObject["$set"] = updateObject["$set"] || {};
        updateObject["$set"][field] = fieldValue.set;
      } else {
        // Default: direct $set
        updateObject["$set"] = updateObject["$set"] || {};
        updateObject["$set"][field] = fieldValue;
      }
    }

    if (!Object.keys(updateObject).length) {
      throw createError(400, "No valid fields provided");
    }

    logger.info(
      `Updating ${modelName} with ID: ${id} | Update Object: ${JSON.stringify(
        updateObject
      )}`
    );

    // --- STEP 5: Perform DB update ---
    const updatedDoc = await Model.findByIdAndUpdate(id, updateObject, {
      new: true,
    });

    if (!updatedDoc) {
      logger.warn(`${modelName} with ID ${id} not found for partial update`);
      throw createError(404, `${modelName} not found`);
    }

    logger.info(`${modelName} ID ${id} partially updated successfully`);
    return updatedDoc;
  } catch (error) {
    logger.error(`Error partially updating ${modelName} ID ${id}:`, error);
    throw createError(500, `Failed to partially update ${modelName}`);
  }
};


