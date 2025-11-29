import notificationService from "../services/notification.service.js";

class NotificationController {
  async create(req, res, next) {
    try {
      const notification = await notificationService.createNotification(req.body);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const notifications = await notificationService.getNotifications();
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async findOne(req, res, next) {
    try {
      const notification = await notificationService.getNotificationById(req.params.id);
      if (!notification) return res.status(404).json({ message: "Notification not found" });
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const notification = await notificationService.updateNotification(req.params.id, req.body);
      if (!notification) return res.status(404).json({ message: "Notification not found" });
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const notification = await notificationService.deleteNotification(req.params.id);
      if (!notification) return res.status(404).json({ message: "Notification not found" });
      res.json({ message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
