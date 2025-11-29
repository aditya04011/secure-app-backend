import Joi from "joi";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Modules-Common","TaskService");

// Joi validation schema
const taskSchema = Joi.object({
  creator: Joi.string().required(),
  assignee: Joi.array().items(Joi.string()).required(),
  academicYear: Joi.number().required(),
  branchId: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().optional(),
  sms: Joi.boolean().optional(),
  whatsapp: Joi.boolean().optional(),
  email: Joi.boolean().optional(),
  pushNotification: Joi.boolean().optional(),
  type: Joi.string().valid("T", "N").required(),
  status: Joi.string().optional(),
  targetDate: Joi.date().optional(),
  completedDate: Joi.date().optional(),
  version: Joi.number().default(1),
});

// Get Schema based on Version
const getSchemaForVersion = (version) => {
  switch (version) {
    case 1:
      return taskSchema;
    case 2:
      return taskSchema.keys({
        extraFieldForV2: Joi.string().optional(),
      });
    case 3:
      return taskSchema.keys({
        extraFieldForV2: Joi.string().optional(),
        newFieldForV3: Joi.string().optional(),
      });
    default:
      return null;
  }
};

// Get all tasks
export const getAllTasks = async (req, res,Task) => {
  try {
    logger.info("Fetching all tasks...");
    const records = await Task.find().populate("creator assignee");
    logger.info(`Fetched ${records.length} tasks successfully.`);
    res.status(200).json(records);
  } catch (error) {
    logger.error("Error fetching tasks", { error: error.message });
    throw createError(500, "Internal server error");
  }
};

// Get task by ID
export const getTaskById = async (req, res,Task) => {
  try {
    logger.info(`Fetching task with ID: ${req.params.id}`);
    const record = await Task.findById(req.params.id).populate("creator assignee");
    if (!record) {
      logger.warn(`Task with ID ${req.params.id} not found.`);
      throw createError(404, "Task not found");
    }
    logger.info(`Fetched task successfully: ${record.title}`);
    res.status(200).json(record);
  } catch (error) {
    logger.error(`Error fetching task with ID: ${req.params.id}`, { error: error.message });
    throw createError(500, "Internal server error");
  }
};

// Create a new task
export const createTask = async (req, res,Task) => {
  try {
    logger.info("Validating task data for creation...");
    const { version = 1 } = req.body;
    const schema = getSchemaForVersion(version);

    if (!schema) {
      logger.warn("Invalid version provided for subject creation.");
      throw createError(400, "Invalid version provided");
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed: ${error.details[0].message}`);
      throw createError(422, error.details[0].message);
    }

    logger.info("Creating new task...");
    const newRecord = new Task(value);
    const savedRecord = await newRecord.save();
    logger.info(`Task created successfully: ${savedRecord.title}`);
    res.status(201).json(savedRecord);
  } catch (error) {
    logger.error("Error creating task", { error: error.message });
    throw createError(500, "Internal server error");
  }
};

// Update an existing task
export const updateTask = async (req, res,Task) => {
  try {
    logger.info(`Validating update data for task ID: ${req.params.id}`);
    const { version = 1 } = req.body;
    const schema = getSchemaForVersion(version);

    if (!schema) {
      logger.warn("Invalid version provided for subject creation.");
      throw createError(400, "Invalid version provided");
    }

    const { error, value } = schema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed for update: ${error.details[0].message}`);
      throw createError(422, error.details[0].message);
    }

    logger.info(`Updating task with ID: ${req.params.id}`);
    const updatedRecord = await Task.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!updatedRecord) {
      logger.warn(`Task with ID ${req.params.id} not found for update.`);
      throw createError(404, "Task not found");
    }

    logger.info(`Task updated successfully: ${updatedRecord.title}`);
    res.status(200).json(updatedRecord);
  } catch (error) {
    logger.error(`Error updating task with ID: ${req.params.id}`, { error: error.message });
    throw createError(500, "Internal server error");
  }
};

// Delete a task
export const deleteTask = async (req, res,Task) => {
  try {
    logger.info(`Attempting to delete task with ID: ${req.params.id}`);
    const deletedRecord = await Task.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      logger.warn(`Task with ID ${req.params.id} not found for deletion.`);
      throw createError(404, "Task not found");
    }

    logger.info(`Task deleted successfully: ${deletedRecord.title}`);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting task with ID: ${req.params.id}`, { error: error.message });
    throw createError(500, "Internal server error");
  }
};
