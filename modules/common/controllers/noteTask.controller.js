import {
  getAllNoteTasks,
  getNoteTaskById,
  createNoteTask,
  updateNoteTask,
  deleteNoteTask,
} from "../services/noteTask.service.js";
import NoteTask from "../models/notetask.model.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Modules-Common","NoteTaskController");

const noteTaskController = {
  getAll: async (req, res, next) => {
    try {
      logger.info("Fetching all note tasks");
      await getAllNoteTasks(req, res, NoteTask);
    } catch (error) {
      logger.error("Error fetching note tasks", { error });
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      logger.info(`Fetching note task with ID: ${req.params.id}`);
      await getNoteTaskById(req, res, NoteTask);
    } catch (error) {
      logger.error("Error fetching note task by ID", { error });
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      logger.info("Creating a new note task", { data: req.body });
      await createNoteTask(req, res, NoteTask);
    } catch (error) {
      logger.error("Error creating note task", { error });
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      logger.info(`Updating note task with ID: ${req.params.id}`, {
        data: req.body,
      });
      await updateNoteTask(req, res, NoteTask);
    } catch (error) {
      logger.error("Error updating note task", { error });
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      logger.info(`Deleting note task with ID: ${req.params.id}`);
      await deleteNoteTask(req, res, NoteTask);
    } catch (error) {
      logger.error("Error deleting note task", { error });
      next(error);
    }
  },
};

export default noteTaskController;
