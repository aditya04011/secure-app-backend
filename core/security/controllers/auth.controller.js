import * as authService from "../services/auth.service.js";
import User from "../models/user.model.js";
import { createError } from "../../../services/errorhandling.service.js";
import loggingService from "../../../services/logging.service.js";
import { authenticateToken, generateAccessToken } from "../utils/jwt.utils.js";

const logger = loggingService.getModuleLogger("Core-Security","AuthController");

export const authController = {
  login: async (req, res, next) => {
    try {
      logger.info("Login request received", { email: req.body.email });

      // Call the login service
      const result = await authService.loginUser(req, res, next, User);

      // If result is null, the error was already handled in the service
      if (!result) {
        return;
      }

      // Return the result to the client
      res.status(200).json(result);
    } catch (error) {
      logger.info("Error in login controller", {
        email: req.body.email,
        error: error,
      });

      // Handle generic errors
      next(createError(500, "Error during login"));
    }
  },
  getUserAndProfile: async (req, res, next) => {
    try {
      logger.info("updated user and profile request received", {
        email: req.body.email,
      });
      const result = await authService.getUserWithPermissionsById(
        req,
        res,
        next,
        User
      );

      // If result is null, the error was already handled in the service
      if (!result) {
        return;
      }
      // Return the result to the client
      res.status(200).json(result);
    } catch (error) {}
  },

  logout: async (req, res, next) => {
    try {
      logger.info("Logout request received", { email: req.body.email });

      // Call the logout service
      const result = await authService.logoutUser(req, res, next, User);

      // If result is null, the error was already handled in the service
      if (!result) {
        return;
      }

      // Return the result to the client
      res.status(200).json(result);
    } catch (error) {
      logger.info("Error in logout controller", {
        email: req.body.email,
        error: error,
      });

      // Handle generic errors
      next(createError(500, "Error during logout"));
    }
  },
  getUserInfo: async (req, res, next) => {
    try {
      logger.info("Get user info request received", {
        userId: req.params.userId,
      });
      const result = await authService.getUserWithPermissionsById(req.params.userId);

      // If result is null, the error was already handled in the service
      if (!result) {
        return;
      }
      // Return the result to the client
      res.status(200).json(result);

    } catch (error) {
      logger.info("Error in get user info controller", {
        userId: req.params.userId,
        error: error,
      });

      // Handle generic errors
      next(createError(500, "Error during get user info"));
    }
  },

  generateToken: async(req, res, next) => {
    try {
      logger.info("Generating token");

      // Call the logout service
      const result = await generateAccessToken(req.body, req.body.userdetails.isPayment);
      // If result is null, the error was already handled in the service
      if (!result) {
        return;
      }

      // Return the result to the client
      res.status(200).json(result);
    } catch (error) {
      logger.info("Error in generating token controller", {
        // email: req.body.email,
        error: error,
      });

      // Handle generic errors
      next(createError(500, "Error during token generation"));
    }
  },
  validateToken: async(req, res, next) => {
    try {
      logger.info("Validating token");

      // Call the logout service
      const result = await authenticateToken(req, res, next);

      // If result is null, the error was already handled in the service
      if (!result) {
        return;
      }

      // Return the result to the client
      // res.status(200).json(result);
    } catch (error) {
      logger.info("Error in Validating token controller", {
        // email: req.body.email,
        error: error,
      });

      // Handle generic errors
      next(createError(500, "Error during token validation"));
    }
  },
};
