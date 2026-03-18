const chatService = require("../services/chatService");

exports.getMessages = async (req, res) => {
    const messages = await chatService.getMessages(
        req.user.id,
        Number(req.params.userId)
    );
    res.json(messages);
};