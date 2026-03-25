const notificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.json(notifications);
};

exports.getUnreadCount = async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
};

exports.markRead = async (req, res) => {
    await notificationService.markNotificationRead(req.params.id);
    res.json({ message: "Notification marked as read" });
};

exports.markAllAsRead = async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: "All notifications marked as read" });
};