import Joi from "joi";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";
import Role from "../../../core/security/models/roles.model.js";
import User from "../../../core/security/models/user.model.js"
import mongoose from "mongoose";
const logger = loggingService.getModuleLogger(
  "Modules-Common",
  "ProfileService"
);

// Function to get valid role names from Role model
const getValidRoleNames = async () => {
  try {
    const roles = await Role.find({}, 'roleName');
    return roles.map(role => role.roleName.toLowerCase());
  } catch (error) {
    logger.error("Error fetching role names", { error });
    // Fallback to hardcoded list if DB fails
    return [
      "superadmin",
      "owner",
      "accountant",
      "manager",
      "admin",
      "parent",
      "student",
      "guardian",
      "faculty",
      "staff",
      "receptionist",
    ];
  }
};

// Joi validation schema function
const getProfileSchema = async (version = 1) => {
  const validTypes = await getValidRoleNames();
  let schema = Joi.object({
    type: Joi.string()
      .valid(...validTypes)
      .required(),
    userId: Joi.string().required(),
    branchId: Joi.array().items(Joi.string()).optional().allow("", null),
    relationId: Joi.array().items(Joi.string()).optional().allow("", null),
    relation: Joi.array().items(Joi.string()).optional().allow("", null),
    gender: Joi.string().optional().allow("", null),
    firstName: Joi.string().required(),
    doB: Joi.date().optional().allow(null), // Accepts "dd-mm-yyyy" format
    middleName: Joi.string().optional().allow("", null),
    lastName: Joi.string().optional().allow("", null),
    aadharNumber: Joi.string().optional().allow("", null),
    primaryNumber: Joi.string().required(),
    secondaryNumber: Joi.string().optional().allow("", null),
    primaryEmail: Joi.string().email().required(),
    secondaryEmail: Joi.string().email().optional().allow("", null),
    occupation: Joi.string().optional().allow("", null),
    presentAddress: Joi.object().optional().allow("", null),
    pincode: Joi.number().optional().allow("", null),
    permanentAddress: Joi.object().optional().allow("", null),
    location: Joi.array().items(Joi.string()).optional().allow("", null),
    documentId: Joi.array().items(Joi.string()).optional().allow("", null),
    highestQualification: Joi.string().optional().allow("", null),
    skills: Joi.any().optional().allow("", null),
    referenceId: Joi.string().optional().allow("", null),
    salary: Joi.number().optional().allow("", null),
    version: Joi.number().default(1),
  });

  switch (version) {
    case 1:
      return schema;
    case 2:
      return schema.keys({
        extraFieldForV2: Joi.string().optional(),
      });
    case 3:
      return schema.keys({
        extraFieldForV2: Joi.string().optional(),
        newFieldForV3: Joi.string().optional(),
      });
    default:
      return null;
  }
};

// Get all profiles
export const getAllProfiles = async (req, res, Profile) => {
  try {
    logger.info("Fetching all profiles...");
    const records = await Profile.find();
    logger.info(`Fetched ${records.length} profiles successfully.`);
    res.status(200).json(records);
  } catch (error) {
    logger.error("Error fetching profiles", { error: error });
    throw createError(500, "Internal server error");
  }
};

export const getProfilesByType = async (req, res, Profile) => {
  try {
    logger.info("Fetching profiles based on type...");

    let allowedTypes = req.query.allowedTypes;

    if (!allowedTypes) {
      return res
        .status(400)
        .json({ message: "allowedTypes query parameter is required" });
    }

    if (typeof allowedTypes === "string") {
      allowedTypes = allowedTypes.split(",").map((type) => type.trim());
    }

    const validTypes = await getValidRoleNames();
    allowedTypes = allowedTypes.filter((type) => validTypes.includes(type.toLowerCase()));

    if (allowedTypes.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid profile types provided" });
    }

    const records = await Profile.find({ type: { $in: allowedTypes } });

    logger.info(`Fetched ${records.length} filtered profiles successfully.`);
    res.status(200).json(records);
  } catch (error) {
    logger.error("Error fetching profiles based on type", { error });
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsersAndProfilesByRoleIds = async (req, res, Profile) => {
  try {
    // Extract roleIds from query, ensure they are converted to ObjectId
    const { roleIds } = req.query;

    if (!roleIds) {
      return res.status(400).json({ message: "roleIds query param is required" });
    }

    // Convert to array + ObjectId
    const roleIdsArray = roleIds.split(",").map(id => new mongoose.Types.ObjectId(id));

    // Step 1: Find all users whose roles contain any of the provided roleIds
    const users = await User.find({
      "roles.roleId": { $in: roleIdsArray }
    });

    if (!users.length) {
      return res.json({ users: [], profiles: [] });
    }

    // Step 2: Extract userIds
    const userIds = users.map(u => u._id);

    // Step 3: Fetch corresponding profiles
    const profiles = await Profile.find({ userId: { $in: userIds } });

    return res.json({
      users,
      profiles
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get profile by ID
export const getProfileById = async (req, res, Profile) => {
  try {
    logger.info(`Fetching profile with ID: ${req.params.id}`);
    const record = await Profile.findById(req.params.id);
    if (!record) {
      logger.warn(`Profile with ID ${req.params.id} not found.`);
      throw createError(404, "Profile not found");
    }
    logger.info(
      `Fetched profile: ${record.firstName} ${record.lastName} ${record._id}`
    );
    // logger.debug("fetched profileData",record);
    res.status(200).json(record);
  } catch (error) {
    logger.error(`Error fetching profile with ID: ${req.params.id}`, {
      error: error,
    });
    throw createError(500, "Internal server error");
  }
};

// Create a new profile
export const createProfile = async (req, res, Profile) => {
  try {
    logger.info("Validating profile data for creation...");
    const { version = 1 } = req.body;
    const schema = await getProfileSchema(version);

    if (!schema) {
      logger.warn("Invalid version provided for subject creation.");
      throw createError(400, "Invalid version provided");
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed: ${error.details[0].message}`);
      throw createError(422, error.details[0].message);
    }

    logger.info("Creating new profile...");
    const newRecord = new Profile(value);
    const savedRecord = await newRecord.save();
    logger.info(
      `Profile created successfully: ${savedRecord.firstName} ${savedRecord.lastName}`
    );
    res.status(201).json(savedRecord);
  } catch (error) {
    logger.error("Error creating profile", { error: error });
    throw createError(500, "Internal server error");
  }
};

// Update an existing profile
export const updateProfile = async (req, res, Profile) => {
  try {
    logger.info(`Validating update data for profile ID: ${req.params.id}`);
    logger.info("updating profileData", req.body);
    const { version = 1 } = req.body;
    const schema = await getProfileSchema(version);

    if (!schema) {
      logger.warn("Invalid version provided for subject creation.");
      throw createError(400, "Invalid version provided");
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed for update: ${error.details[0].message}`);
      throw createError(422, error.details[0].message);
    }

    logger.info(`Updating profile with ID: ${req.params.id}`);
    const updatedRecord = await Profile.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true }
    );
    if (!updatedRecord) {
      logger.warn(`Profile with ID ${req.params.id} not found for update.`);
      throw createError(404, "Profile not found");
    }

    logger.info(
      `Profile updated successfully: ${updatedRecord.firstName} ${updatedRecord.lastName} ${updatedRecord._id}`
    );
    res.status(200).json(updatedRecord);
  } catch (error) {
    logger.error(`Error updating profile with ID: ${req.params.id}`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      kind: error.kind,
      details: error.errors || null,
    });

    // In dev, return the full error message for debugging
    if (process.env.NODE_ENV === "development") {
      return res.status(error.status || 500).json({
        message: error.message,
        name: error.name,
        kind: error.kind,
        details: error.errors || null,
      });
    }

    // In production, return a safe, generic message
    return res
      .status(error.status || 500)
      .json({ message: "Internal server error" });
  }
};

//update only particular field
export const patchProfile = async (req, res, Profile) => {
  try {
    logger.info(`Patching profile for userId: ${req.params.id}`);
    logger.info("patch payload", req.body);

    const searchCriteria = req.body.useId ? { _id: req.params.id } : { userId: req.params.id };

    // Directly update with whatever frontend sends
    const updatedRecord = await Profile.findOneAndUpdate(
      searchCriteria, // use searchCriteria (userId or _id)
      { $set: req.body },
      { new: true }
    );

    if (!updatedRecord) {
      logger.warn(`Profile with id ${req.params.id} not found for patch.`);
      return res.status(404).json({ message: "Profile not found" });
    }

    logger.info(`Profile patched successfully: ${updatedRecord._id}`);
    res.status(200).json(updatedRecord);
  } catch (error) {
    logger.error(`Error patching profile with id: ${req.params.id}`, {
      error,
    });
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a profile
export const deleteProfile = async (req, res, Profile) => {
  try {
    logger.info(`Attempting to delete profile with ID: ${req.params.id}`);
    const deletedRecord = await Profile.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      logger.warn(`Profile with ID ${req.params.id} not found for deletion.`);
      throw createError(404, "Profile not found");
    }

    logger.info(
      `Profile deleted successfully: ${deletedRecord.firstName} ${deletedRecord.lastName} ${deletedRecord._id}`
    );
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting profile with ID: ${req.params.id}`, {
      error: error,
    });
    throw createError(500, "Internal server error");
  }
};
