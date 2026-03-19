const prisma = require("../config/prisma");

async function getMessages(userId, otherUserId) {
    return prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId}
            ]
        },
        orderBy: {
            createdAt: "asc"
        }
    });
}

async function getUnreadCount(userId) {
    return prisma.message.count({
        where: {
            receiverId: userId,
            isRead: false
        }
    });
}

async function markAsRead(userId, otherUserId) {
    return prisma.message.updateMany({
        where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false
        },
        data: {
            isRead: true
        }
    });
}

module.exports = {
    getMessages,
    getUnreadCount,
    markAsRead
};