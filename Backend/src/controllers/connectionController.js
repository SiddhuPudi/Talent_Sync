const connectionService = require("../services/connectionService");

exports.sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const connection = await connectionService.sendRequest(
            req.user.id,
            receiverId
        );
        
        const io = req.app.get("io");
        if (io) {
            const redis = require("../config/redis");
            const receiverSocketId = await redis.get(`online:${receiverId}`);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", {
                    type: "connection_request",
                    from: req.user.id,
                    message: "You received a new connection request"
                });
            }
        }
        res.json(connection);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.respondRequest = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ 
                message: "Invalid status. Must be 'accepted' or 'rejected'."
            });
        }
        const result = await connectionService.respondRequest(
            req.params.id,
            req.user.id,
            status
        );
        
        const io = req.app.get("io");
        if (io) {
            const redis = require("../config/redis");
            // The person being responded to is the original sender
            const receiverSocketId = await redis.get(`online:${result.senderId}`);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", {
                    type: `connection_${status}`,
                    from: req.user.id,
                    message: `Your connection request was ${status}`
                });
            }
        }
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getConnections = async (req, res) => {
    const data = await connectionService.getConnections(req.user.id);
    res.json(data);
}

exports.getPendingRequests = async (req, res) => {
    const requests = await connectionService.getPendingRequests(req.user.id);
    res.json(requests);
}