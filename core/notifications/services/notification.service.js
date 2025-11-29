import Joi from "joi";
import Notification from "../models/notification.model.js";
import loggingService from "../../../services/logging.service.js";

const logger = loggingService.getModuleLogger(
  "Module-Admissions",
  "Installment Notify Service"
);

// ------------------
// Joi Validation
// ------------------
const createNotificationSchema = Joi.object({
  serviceName: Joi.string()
    .required()
    .description("Name of the notification service (e.g., whatsapp, email)"),

  permissions: Joi.object()
    .pattern(
      Joi.string(), // module name e.g. admissions, schedules
      Joi.object({
        services: Joi.object().pattern(
          Joi.string(), // service name e.g. task, discount
          Joi.object({
            enable: Joi.boolean().required(),
          })
        ),
      })
    )
    .default({})
    .description("Dynamic modules with services"),
  
  version: Joi.number().default(1),
});

const updateNotificationSchema = createNotificationSchema.fork(
  ["serviceName"],
  (schema) => schema.optional()
);

// ------------------
// Service Class
// ------------------
class NotificationService {
  async createNotification(data) {
    try {
      const { error, value } = createNotificationSchema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
      });

      if (error) {
        logger.warn("Validation failed on createNotification", { details: error.details });
        throw new Error(`Validation error: ${error.message}`);
      }

      const notification = new Notification(value);
      await notification.save();
      logger.info("Notification created", { id: notification._id });
      return notification;
    } catch (error) {
      logger.error("Error creating notification", { error });
      throw error;
    }
  }

  async getNotifications() {
    try {
      const notifications = await Notification.find();
      logger.info("Fetched all notifications");
      return notifications;
    } catch (error) {
      logger.error("Error fetching notifications", { error });
      throw error;
    }
  }

  async getNotificationById(id) {
    try {
      const notification = await Notification.findById(id);
      if (!notification) {
        logger.warn("Notification not found", { id });
        return null;
      }
      logger.info("Fetched notification by ID", { id });
      return notification;
    } catch (error) {
      logger.error("Error fetching notification by ID", { error });
      throw error;
    }
  }

  async updateNotification(id, data) {
    try {
      const { error, value } = updateNotificationSchema.validate(data, {
        abortEarly: false,
        allowUnknown: true,
      });

      if (error) {
        logger.warn("Validation failed on updateNotification", { details: error.details });
        throw new Error(`Validation error: ${error.message}`);
      }

      const notification = await Notification.findByIdAndUpdate(id, value, {
        new: true,
      });

      if (!notification) {
        logger.warn("Notification not found for update", { id });
        return null;
      }
      logger.info("Notification updated", { id });
      return notification;
    } catch (error) {
      logger.error("Error updating notification", { error });
      throw error;
    }
  }

  async deleteNotification(id) {
    try {
      const notification = await Notification.findByIdAndDelete(id);
      if (!notification) {
        logger.warn("Notification not found for delete", { id });
        return null;
      }
      logger.info("Notification deleted", { id });
      return notification;
    } catch (error) {
      logger.error("Error deleting notification", { error });
      throw error;
    }
  }
}

export default new NotificationService();
