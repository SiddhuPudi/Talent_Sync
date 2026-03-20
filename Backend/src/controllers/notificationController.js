const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.json(notifications);
};

exports.markRead = async (req, res) => {
    await notificationService.markNotificationRead(req.param.id);
    res.json({ message: "Notification marked as read" });
};