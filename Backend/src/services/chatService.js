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

module.exports = {
    getMessages
};