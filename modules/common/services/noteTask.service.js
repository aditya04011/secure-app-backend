import Joi from "joi";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Modules-Common","NoteTaskService");

// Joi validation schema
const noteTaskSchema = Joi.object({
  referenceId: Joi.string().optional(),
  creator: Joi.string().required(),
  description: Joi.string().required(),
  sms: Joi.boolean().optional(),
  whatsapp: Joi.boolean().optional(),
  email: Joi.boolean().optional(),
  type: Joi.string().required(),
  status: Joi.string().optional(),
  version: Joi.number().default(1),
});

// Get Schema based on Version
const getSchemaForVersion = (version) => {
  switch (version) {
    case 1:
      return noteTaskSchema;
    case 2:
      return noteTaskSchema.keys({
        extraFieldForV2: Joi.string().optional(),
      });
    case 3:
      return noteTaskSchema.keys({
        extraFieldForV2: Joi.string().optional(),
        newFieldForV3: Joi.string().optional(),
      });
    default:
      return null;
  }
};

// Get all note tasks
export const getAllNoteTasks = async (req, res, NoteTask) => {
  try {
    logger.info("Fetching all note tasks...");
    const records = await NoteTask.find();
    logger.info(`Fetched ${records.length} note tasks successfully.`);
    res.status(200).json(records);
  } catch (error) {
    logger.error("Error fetching note tasks", { error: error.message });
    throw createError(500, "Internal server error");
  }
};

// Get note task by ID
export const getNoteTaskById = async (req, res, NoteTask) => {
  try {
    logger.info(`Fetching note task with ID: ${req.params.id}`);
    const record = await NoteTask.findById(req.params.id);
    if (!record) {
      logger.warn(`Note task with ID ${req.params.id} not found.`);
      throw createError(404, "Note task not found");
    }
    logger.info(`Fetched note task successfully: ${record.description}`);
    res.status(200).json(record);
  } catch (error) {
    logger.error(`Error fetching note task with ID: ${req.params.id}`, {
      error: error.message,
    });
    throw createError(500, "Internal server error");
  }
};

// Create a new note task
export const createNoteTask = async (req, res, NoteTask) => {
  try {
    logger.info("Validating note task data for creation...");
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

    logger.info("Creating new note task...");
    const newRecord = new NoteTask(value);
    const savedRecord = await newRecord.save();
    logger.info(`Note task created successfully by: ${savedRecord.creator}`);
    res.status(201).json(savedRecord);
  } catch (error) {
    logger.error("Error creating note task", { error: error.message });
    throw createError(500, "Internal server error");
  }
};

// Update an existing note task
export const updateNoteTask = async (req, res, NoteTask) => {
  try {
    logger.info(`Validating update data for note task ID: ${req.params.id}`);
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

    logger.info(`Updating note task with ID: ${req.params.id}`);
    const updatedRecord = await NoteTask.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true }
    );
    if (!updatedRecord) {
      logger.warn(`Note task with ID ${req.params.id} not found for update.`);
      throw createError(404, "Note task not found");
    }

    logger.info(`Note task updated successfully: ${updatedRecord.description}`);
    res.status(200).json(updatedRecord);
  } catch (error) {
    logger.error(`Error updating note task with ID: ${req.params.id}`, {
      error: error.message,
    });
    throw createError(500, "Internal server error");
  }
};

// Delete a note task
export const deleteNoteTask = async (req, res, NoteTask) => {
  try {
    logger.info(`Attempting to delete note task with ID: ${req.params.id}`);
    const deletedRecord = await NoteTask.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      logger.warn(`Note task with ID ${req.params.id} not found for deletion.`);
      throw createError(404, "Note task not found");
    }

    logger.info(`Note task deleted successfully: ${deletedRecord.description}`);
    res.status(200).json({ message: "Note task deleted successfully" });
  } catch (error) {
    logger.error(`Error deleting note task with ID: ${req.params.id}`, {
      error: error.message,
    });
    throw createError(500, "Internal server error");
  }
};
