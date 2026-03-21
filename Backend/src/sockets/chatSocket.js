const prisma = require("../config/prisma");
const redis = require("../config/redis");
const notificationService = require("../services/notificationService");
const { sendNotificationEvent } = require("../services/kafkaProducer");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id);
        socket.on("join", async (userId) => {
            await redis.set(`online:${userId}`, socket.id);
            io.emit("userOnline", userId);
        });
        socket.on("typing", async ({ senderId, receiverId }) => {
            const receiverSocketId = await redis.get(`online:${receiverId}`);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", { senderId });
            }
        });
        socket.on("stopTyping", async ({ senderId, receiverId }) => {
            const receiverSocketId = await redis.get(`online:${receiverId}`);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userStoppedTyping", { senderId });
            }
        });
        socket.on("sendMessage", async (data) => {
            const { senderId, receiverId, content } = data;
            try {
                const connection = await prisma.connection.findFirst({
                    where: {
                        OR: [
                            { senderId: senderId, receiverId: receiverId, status: "accepted" },
                            { senderId: receiverId, receiverId: senderId, status: "accepted" }
                        ]
                    }
                });
                if(!connection) {
                    return socket.emit("errorMessage", {
                        message: "❌ You are not connected with this user"
                    });
                }
                const message = await prisma.message.create({
                    data: {
                        senderId,
                        receiverId,
                        content,
                        isRead: false
                    }
                });
                console.log("💾 Message saved:", message);
                await sendNotificationEvent({
                    userId: receiverId,
                    type: "message",
                    message: `New message from user ${senderId}`
                });
                const receiverSocketId = await redis.get(`online:${receiverId}`);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", message);
                    io.to(receiverSocketId).emit("newNotification", {
                        type: "message",
                        from: senderId,
                        message: content
                    });
                } else {
                    console.log("📥 User offline → message stored only");
                }
            } catch (error) {
                console.error(error);
            }
        });
        socket.on("disconnect", async () => {
            const keys = await redis.keys("online:*");
            for (let key of keys) {
                const socketId = await redis.get(key);
                if (socketId === socket.id) {
                    const userId = key.split(":")[1];
                    await redis.del(key);
                    io.emit("userOffline", userId);
                    break;
                }
            }
        });
    });
};