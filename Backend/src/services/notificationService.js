const prisma = require("../config/prisma");

async function createNotification(userId, type, message) {
    return prisma.notification.create({
        data: {
            userId,
            type,
            message
        }                
    });
}

async function getNotifications(userId) {
    return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
    });
}

async function markNotificationRead(id) {
    return prisma.notification.update({
        where: { id: Number(id) },
        data: { isRead: true }
    });
}

async function getUnreadCount(userId) {
    return prisma.notification.count({
        where: { userId: Number(userId), isRead: false }
    });
}

async function markAllAsRead(userId) {
    return prisma.notification.updateMany({
        where: { userId: Number(userId), isRead: false },
        data: { isRead: true }
    });
}

module.exports = {
    createNotification,
    getNotifications,
    markNotificationRead,
    getUnreadCount,
    markAllAsRead
}