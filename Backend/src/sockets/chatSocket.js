const prisma = require("../config/prisma");
const onlineUsers = require("./onlineUsers");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id);
        socket.on("join", (userId) => {
            onlineUsers.set(userId.toString(), socket.id);
            console.log("User online: ", userId);
            io.emit("userOnline", userId);
        });
        socket.on("sendMessage", async (data) => {
            const { senderId, receiverId, content } = data;
            console.log("Incoming message: ", data);
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
                        content
                    }
                });
                console.log("💾 Message saved:", message);
                const receiverSocketId = onlineUsers.get(receiverId.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", message);
                    console.log("📥 Message delivered in real-time");
                } else {
                    console.log("📥 User offline → message stored only");
                }
            } catch (error) {
                console.error(error);
            }
        });
        socket.on("disconnect", () => {
            let disconnectedUser = null;
            for (let [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) {
                    disconnectedUser = userId;
                    onlineUsers.delete(userId);
                    break;
                }
            }
            if (disconnectedUser) {
                console.log("User offline: ", disconnectedUser);
                io.emit("userOffline", disconnectedUser);
            }
        });
    });
};