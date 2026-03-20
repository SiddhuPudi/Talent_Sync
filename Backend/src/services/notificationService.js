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

module.exports = {
    createNotification,
    getNotifications,
    markNotificationRead
}