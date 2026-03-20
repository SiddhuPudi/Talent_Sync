const prisma = require("../config/prisma");
const notificationService = require("./notificationService");

async function sendRequest(senderId, receiverId) {
    senderId = Number(senderId);
    receiverId = Number(receiverId);
    if (senderId === receiverId) {
        throw new Error("Cannot connect with yourself.");
    }
    const existing = await prisma.connection.findFirst({
        where: {
            OR: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }
    });
    if (existing) {
        if (existing.status === "pending") {
            throw new Error("Connection request already pending");
        }
        if (existing.status === "accepted") {
            throw new Error("You are already connected");
        }
    }
    await notificationService.createNotification(
        Number(receiverId),
        "connection_request",
        `User ${senderId} sent you a connection request`
    );
    return prisma.connection.create({
        data: {
            senderId,
            receiverId,
        }
    });
}

async function respondRequest(connectionId, userId, status) {
    const connection = await prisma.connection.findUnique({
        where: { id: Number(connectionId) }
    });
    if (!connection) {
        throw new Error("Request not found");
    }
    if (connection.receiverId !== userId) {
        throw new Error("Not authorized to respond");
    }
    if (connection.status !== "pending") {
        throw new Error("Request already handled");
    }
    await notificationService.createNotification(
        Number(connection.senderId),
        "connection_accepted",
        `User ${userId} accepted your request`
    );
    return prisma.connection.update({
        where: { id: Number(connectionId) },
        data: { status }
    });
}

async function getConnections(userId) {
    return prisma.connection.findMany({
        where: {
            OR: [
                { senderId: userId, status: "accepted" },
                { receiverId: userId, status: "accepted" }
            ]
        }
    });
}

async function getPendingRequests(userId) {
    return prisma.connection.findMany({
       where: {
        receiverId: userId,
        status: "pending"
       },
       include: {
        sender: {
            select: {
                id: true,
                name: true,
                email: true
            }
        }
       }
    });
}

module.exports = {
    sendRequest,
    respondRequest,
    getConnections,
    getPendingRequests
}