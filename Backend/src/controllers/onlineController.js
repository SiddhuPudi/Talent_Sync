const onlineUsers = require("../sockets/onlineUsers");

exports.getOnlineUsers = (req, res) => {
    const users = Array.from(onlineUsers.keys());
    res.json(users);
}