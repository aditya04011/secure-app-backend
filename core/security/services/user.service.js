import joi from "joi";
import Project from "../../../modules/taskmanagement/models/project.model.js";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";
import Role from "../models/roles.model.js";
// Initialize the logger for the UserService
const logger = loggingService.getModuleLogger("Core-Security","UserService");

// Base schema for user validation
const baseSchema = {
  username: joi.string().min(3).max(30),
  email: joi.string().min(3).max(100).required(),
  password: joi.string().min(3).max(30).required(),
  roles: joi
    .array()
    .items(
      joi.object({
        // branchName: joi.string().min(1).required(),
        roleId: joi.string().length(24).required(), // Assuming MongoDB ObjectId
        branchId: joi.string().required(), // Assuming MongoDB ObjectId
      })
    )
    .min(1)
    .required(),
  isActive: joi.boolean().optional(),
  version: joi.number().default(1),
};

// Helper function to get schema by version
const getUserSchema = (version) => {
  const schemas = {
    1: joi.object(baseSchema),
    2: joi.object({ ...baseSchema, extraFieldV2: joi.string().optional() }),
  };
  return schemas[version] || createError(400, "Invalid version");
};

/**
 * Fetch all users
 * Logs the operation and handles success or error responses.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @param {object} User - User model for database interaction.
 */
export const getAllUsers = async (req, res, next, User) => {
  try {
    logger.info("Service:Fetching all users");
    const users = await User.find();
    logger.debug("Fetched all users successfully", { count: users.length });
    res.status(200).json(users);
  } catch (error) {
    logger.error("Error fetching users", { error: error});
    next(createError(500, "Internal server error"));
  }
};

/**
 * Create a new user
 * Logs the operation, validates the input, and assigns permissions based on the role.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @param {object} User - User model for database interaction
 */
export const createUser = async (req, res, next, User) => {
  try {
    logger.info("Service:Creating user");
    logger.debug("Payload received", { payload: req.body });
    const { error, value } = getUserSchema(req.body.version || 1).validate(
      req.body
    );
    if (error) {
      logger.warn("Validation failed", {
        validationError: error.details[0].message,
      });
      return next(createError(422, error.details[0].message));
    }

    // Check for existing user
    logger.debug("Checking for existing user", { email: value.email });
    const existingUser = await User.findOne({
      $or: [{ email: value.email.toLowerCase() }],
    });
    if (existingUser) {
      logger.warn("User already exists", { email: value.email });
      return res.status(409).json({
        status: "Conflict",
        message: "User with this email already exists",
        userMail: value.email
      });
    }

    // Create the user first
    logger.info("Creating a new user");
    const user = await new User(value).save();
    logger.info("User created", { userId: user._id, userName: user.username });

    // ===== Role Check: Skip project creation for student/parent/guardian =====

    const roleIds = value.roles.map((r) => r.roleId); // array of roleId (ObjectId)

    const rolesFromDb = await Role.find({ _id: { $in: roleIds } });

    const nonProjectRoles = ["student", "parent", "guardian"];
    const hasExcludedRole = rolesFromDb.some((role) =>
      nonProjectRoles.includes(role.roleName.toLowerCase())
    );

    if (hasExcludedRole) {
      logger.info("Project creation skipped for user with excluded role", {
        userId: user._id,
        roles: rolesFromDb.map((r) => r.roleName),
      });

      return res.status(201).json({ user, selfAssignedProject: null });
    }

    // Now create a project using the user's ID (exclude parent,student,guardian)
    const projectData = {
      title: "Self Assigned",
      description: "For assigning self tasks",
      assignee: [user._id], // Use the user ID instead of username
      owner: user._id, // Use the user ID instead of username
      academicYear: 2026,
      notes: [],
      task: [],
      branch: value.roles[0].branchName,
      targetDate: null,
    };

    const selfAssignedProject = await new Project(projectData).save();
    logger.info("Created self assigned project for user", {
      userId: user._id,
      userName: user.username,
      projectId: selfAssignedProject._id,
    });

    if (!res.headersSent) {
      res.status(201).json({ user, selfAssignedProject });
    }
  } catch (error) {
    logger.error("Error creating user", { error: error});
    if (!res.headersSent) {
      next(createError(500, "Internal server error"));
    }
  }
};

/**
 * Get a user by ID
 * Logs the operation, checks if the user exists, and returns user data if found.
 * @param {object} req - Express request object containing the user ID in the URL parameters
 * @param {object} res - Express response object to send the response with user data or error message
 * @param {function} next - Express next middleware function to handle errors
 * @param {object} User - User model for database interaction
 * @returns {object} JSON response with the user data or an error message
 * @throws {Error} Throws an error if there's an issue with the database query or if user is not found
 */
export const getUserById = async (req, res, next, User) => {
   const userId = req.params.id;
  try {
   
    logger.info("Fetching user by ID", { userId: userId});

    const user = await User.findById(userId);

    if (!user) {
      logger.warn("User not found",  userId);
      return next(createError(404, "User not found"));
    }

    logger.info("User fetched successfully By Id", { userId} );
    res.status(200).json(user);
  } catch (error) {
      logger.error("Error fetching user", {userId:userId, error: error });
    next(createError(500, "Internal server error"));
  }
};

/**
 * Get a user by email
 * Logs the operation, checks if the user exists, and returns user data if found.
 * @param {object} req - Express request object containing the user email in the URL parameters
 * @param {object} res - Express response object to send the response with user data or error message
 * @param {function} next - Express next middleware function to handle errors
 * @param {object} User - User model for database interaction
 * @returns {object} JSON response with the user data or an error message
 * @throws {Error} Throws an error if there's an issue with the database query or if user is not found
 */
export const getUserByEmail = async (req, res, next, User) => {
  const email = req.params.email;
  try {
    logger.info("Fetching user by email", { email: email });

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      logger.warn("User not found", { email: email });
      return next(createError(404, "User not found"));
    }

    logger.info("User fetched successfully by email", {
      email: email,
      userId: user._id,
    });

    return res.status(200).json(user); // ✅ Return user if found
  } catch (error) {
    logger.error("Error fetching user by email", { email: email, error: error });
    return next(createError(500, "Internal server error"));
  }
};

/**
 * Update a user by ID
 * Logs the operation, validates input, and updates role and permissions.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @param {object} User - User model for database interaction
 */
export const updateUserById = async (req, res, next, User) => {
  const userId=req.params.id;
  const {username, email}=req.body;
  try {
    logger.info("Updating user", { userId:userId,userName:username});
    logger.info("Updating userData",req.body);
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("User not found", { userId: userId});
      return next(createError(404, "User not found"));
    }

    const { error, value } = getUserSchema(req.body.version || 1).validate(
      req.body
    );
    if (error) {
      logger.warn("Validation failed", {
        validationError: error.details[0].message,
      });
      return next(createError(422, error.details[0].message));
    }

    if (value.role && value.role !== user.role) {
      logger.debug("Checking new role", { role: value.role });
      const role = await Role.findOne({ roleName: value.role });
      if (!role) {
        logger.warn("Role not found", { roleName: value.role });
        return next(createError(400, `Role '${value.role}' not found`));
      }
      value.permissions = role.permissions;
    }

    const updatedUser = await User.findByIdAndUpdate( userId , value, {
      new: true,
    });
    logger.info("User updated successfully", {
      userId: userId,
      userName:username,
    });
    res.status(200).json({user: updatedUser});
  } catch (error) {
    // Handle MongoDB duplicate key error (E11000)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      logger.warn("Duplicate key error during user update", {
        userId: userId,
        userName: username,
        error: error.message
      });
      return res.status(409).json({
        status: "Conflict",
        message: "User with this email already exists",
        userMail: email
      });
    }else{

    logger.error("Error updating user by ID", {userId:userId,userName:username, error: error });
    next(createError(500, "Internal server error"));
    }
  }
};

export const updateUserStatus = async (req, res, User) => {
  try {
    const { status } = req.body;
    logger.info(`Updating User status: ${status} with ID: ${req.params.id}`);
    const updatedRecord = await User.findById(req.params.id);

    if (!updatedRecord) {
      logger.warn(`User with ID ${req.params.id} not found for update.`);
      throw createError(404, "User not found");
    }

    updatedRecord.isActive = status;

    updatedRecord.save();
    logger.info(
      `User status updated successfully: ${updatedRecord.username} ${updatedRecord._id}`
    );
    res.status(200).json(updatedRecord);
  } catch (error) {
    logger.error(`Error updating User status with ID: ${req.params.id}`, {
      error: error
    });
    throw createError(500, "Internal server error");
  }
};

/**
 * Soft delete a user by ID
 * Logs the operation and marks the user as inactive.
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 * @param {object} User - User model for database interaction
 */
export const deleteUserById = async (req, res, next, User) => {
   const userId = req.params.id;
  try {
    logger.info("Soft deleting user by Id", { userId });
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(createError(404, "User not found"));
    }
    user.isActive = false;
    await user.save();
    logger.info("User marked as inactive ", {
      userId,
      username: user.username,
    });
    res.status(200).json({ message: "User successfully soft deleted" });
  } catch (error) {
    logger.error("Error soft deleting user ", { userId:userId,error: error });
    next(createError(500, "Internal server error"));
  }
};

export const deleteUserByIdPermanently = async (req, res, next, User) => {
    const userId = req.params.id;
  try {
    logger.info("Permanently deleting user", { userId:userId});
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("User not found", { userId });
      return next(createError(404, "User not found"));
    }

    const data = await user.deleteOne({ _id: userId });
    logger.info("User deleted permanently", {userId:userId,userName:user.username,
      deletedCount: data.deletedCount,
    });
    res
      .status(200)
      .send({ message: "User deleted", deletedCount: data.deletedCount });
  } catch (error) {
    logger.error("Error permanently deleting user", { userId:userId,error: error });
    next(createError(500, "Internal server error"));
  }
};

export const changePassword = async (userId, username, newPassword, prevPassword, User) => {
  try {
    logger.info("Initiating password change", { userId, userName: username });

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("User not found during password change attempt", { userId, userName: username });
      throw createError(404, "User not found");
    }

    // if (!(await user.comparePassword(prevPassword))) {
    //   logger.warn("Previous password incorrect", { userId, userName: username });
    //   throw createError(401, "Previous password is incorrect");
    // }

    // Compare previous password as plain string
    if (user.password !== prevPassword) {
      logger.warn("Previous password does not match", { userId, userName: username });
      throw createError(401, "Previous password is incorrect");
    }

    user.password = newPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    logger.info("Password changed successfully", { userId, userName: username });
    return "Password changed successfully.";
  } catch (error) {
    logger.error("Password change failed", {
      userId,
      userName: username,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
