import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task.service.js";
import Task from "../models/task.model.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Modules-Common","TaskController");

const taskController = {
  getAll: async (req, res, next) => {
    try {
      logger.info("Fetching all tasks");
      await getAllTasks(req, res, Task);
    } catch (error) {
      logger.error("Error fetching tasks", { error });
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      logger.info(`Fetching task with ID: ${req.params.id}`);
      await getTaskById(req, res, Task);
    } catch (error) {
      logger.error("Error fetching task by ID", { error });
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      logger.info("Creating a new task", { data: req.body });
      await createTask(req, res, Task);
    } catch (error) {
      logger.error("Error creating task", { error });
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      logger.info(`Updating task with ID: ${req.params.id}`, {
        data: req.body,
      });
      await updateTask(req, res, Task);
    } catch (error) {
      logger.error("Error updating task", { error });
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      logger.info(`Deleting task with ID: ${req.params.id}`);
      await deleteTask(req, res, Task);
    } catch (error) {
      logger.error("Error deleting task", { error });
      next(error);
    }
  },
};

export default taskController;
