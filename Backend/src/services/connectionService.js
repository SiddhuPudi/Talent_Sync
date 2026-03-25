const prisma = require("../config/prisma");
const { sendNotificationEvent } = require("./kafkaProducer");

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
    await sendNotificationEvent({
        userId: Number(receiverId),
        type: "connection_request",
        message: `User ${senderId} sent you a connection request`
    });
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
    await sendNotificationEvent({
        userId: Number(connection.senderId),
        type: "connection_accepted",
        message: `User ${userId} accepted your request`
    });
    return prisma.connection.update({
        where: { id: Number(connectionId) },
        data: { status }
    });
}

async function getConnections(userId) {
    return prisma.connection.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        include: {
            sender: {
                select: { id: true, name: true, email: true }
            },
            receiver: {
                select: { id: true, name: true, email: true }
            }
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