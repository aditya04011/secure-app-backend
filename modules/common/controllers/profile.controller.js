import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfilesByType,
  patchProfile,
  getUsersAndProfilesByRoleIds,
} from "../services/profile.service.js";
import Profile from "../models/profile.model.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger("Modules-Common","ProfileController");

const profileController = {
  getAll: async (req, res, next) => {
    try {
      logger.info("Fetching all profiles");
      await getAllProfiles(req, res, Profile);
    } catch (error) {
      logger.error(`Error fetching all profiles: ${error.message}`);
      next(error);
    }
  },
  getAllByType: async (req, res, next) => {
    try {
      logger.info("Fetching all profiles by type");
      await getProfilesByType(req, res, Profile);
    } catch (error) {
      logger.error(`Error fetching all profiles by type: ${error.message}`);
      next(error);
    }
  },
  getAllByRoleIds: async (req, res, next) => {
    try {
      logger.info("Fetching profiles and users by roleId's");
      await getUsersAndProfilesByRoleIds(req, res, Profile);
    } catch (error) {
      logger.error(`Error fetching profiles and users by roleId's: ${error.message}`);
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      logger.info(`Fetching profile with ID: ${req.params.id}`);
      await getProfileById(req, res, Profile);
    } catch (error) {
      logger.error(
        `Error fetching profile with ID ${req.params.id}: ${error.message}`
      );
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      logger.info("Creating a new profile");
      await createProfile(req, res, Profile);
    } catch (error) {
      logger.error(`Error creating profile: ${error.message}`);
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      logger.info(`Updating profile with ID: ${req.params.id}`);
      await updateProfile(req, res, Profile);
    } catch (error) {
      logger.error(
        `Error updating profile with ID ${req.params.id}: ${error.message}`
      );
      next(error);
    }
  },

  patch: async (req, res, next) => {
    try {
      logger.info(`Patching profile with ID: ${req.params.id}`);
      await patchProfile(req, res, Profile);
    } catch (error) {
      logger.error(
        `Error patching profile with ID ${req.params.id}: ${error.message}`
      );
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      logger.info(`Deleting profile with ID: ${req.params.id}`);
      await deleteProfile(req, res, Profile);
    } catch (error) {
      logger.error(
        `Error deleting profile with ID ${req.params.id}: ${error.message}`
      );
      next(error);
    }
  },
};

export default profileController;
