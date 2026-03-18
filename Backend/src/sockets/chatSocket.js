const prisma = require("../config/prisma");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("User connected: ", socket.id);
        socket.on("join", (userId) => {
            socket.join(userId.toString());
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
                        message: "You are not connected with this user"
                    });
                }
                console.log("✅ Connection found");
                const message = await prisma.message.create({
                    data: {
                        senderId,
                        receiverId,
                        content
                    }
                });
                console.log("💾 Message saved:", message);
                io.to(receiverId.toString()).emit("receiveMessage", message);
            } catch (error) {
                console.error(error);
            }
        });
        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
        });
    });
};