const chatService = require("../services/chatService");

exports.getMessages = async (req, res) => {
    const messages = await chatService.getMessages(
        req.user.id,
        Number(req.params.userId)
    );
    res.json(messages);
};

exports.getUnreadCount = async (req, res) => {
    const count = await chatService.getUnreadCount(req.user.id);
    res.json({ unread: count });
}

exports.markAsRead = async (req, res) => {
    await chatService.markAsRead(
        req.user.id,
        Number(req.params.userId)
    );
    res.json({ message: "Message marked as read" });
}