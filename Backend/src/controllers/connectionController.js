const connectionService = require("../services/connectionService");

exports.sendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const connection = await connectionService.sendRequest(
            req.user.id,
            receiverId
        );
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