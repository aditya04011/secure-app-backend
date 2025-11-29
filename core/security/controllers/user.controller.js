import {
  getAllUsers,
  createUser,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  deleteUserByIdPermanently,
  changePassword,
  updateUserStatus
} from "../services/user.service.js";
import User from "../models/user.model.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Core-Security","UserController");

export const userController = {
  getAll: async (req, res, next) => {
    try {
      logger.info("Controller: Fetching all users");
      await getAllUsers(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error fetching all users", {
        error: error.message
      });
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      logger.info("Controller: Creating a new user");
      await createUser(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error creating new user", { error: error.message });
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      logger.info("Controller: Fetching user by ID", { userId: req.params.id });
      await getUserById(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error fetching user by Id", {
        error: error.message
      });
      next(error);
    }
  },

  getByEmail: async (req, res, next) => {
    try {
      logger.info("Controller: Fetching user by email", { email: req.params.email });
      await getUserByEmail(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error fetching user by email", {
        error: error.message
      });
      next(error);
    }
  },
  updateById: async (req, res, next) => {
    try {
      logger.info("Controller: Updating user by Id", { userId: req.params.id });
      await updateUserById(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error updating user by Id", { error: error.message });
      next(error);
    }
  },
  updateStatus: async(req, res, next)=> {
    try {
      logger.info(`Updating User status with ID: ${req.params.id}`);
      await updateUserStatus(req, res, User);
    } catch (error) {
      logger.error(
        `Error updating User status with ID ${req.params.id}: ${error.message}`
      );
      next(error);
    }
  },

  deleteById: async (req, res, next) => {
    try {
      logger.info("Controller: Deleting user by id", { userId: req.params.id });
      await deleteUserById(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error deleting user by Id", { error: error.message });
      next(error);
    }
  },
  deleteByIdPermanently:async(req,res,next)=>{

    try {
      logger.info("Controller: Deleting user permanently by Id", { userId: req.params.id });
      await deleteUserByIdPermanently(req, res, next, User);
    } catch (error) {
      logger.error("Controller: Error deleting user permanently by Id", { error: error.message });
      next(error);
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {prevPassword, newPassword ,username} = req.body;
      logger.info("Controller: changingPassword", { userId: id });
      const message = await changePassword(id,username, newPassword, prevPassword, User);

      res.status(200).json({ message });
    } catch (error) {
      const status = error.status || 500;
      logger.error("Controller: Error changing password", {
        error: error.message,
        status,
        userId: req.params.id
      });
      next(error);
    }
  }
};
