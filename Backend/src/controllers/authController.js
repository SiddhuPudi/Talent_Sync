const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        const token = generateToken(user.id);
        res.status(201).json({
            token,
            user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const user = await authService.loginUser(req.body);
        const token = generateToken(user.id);
        res.json({
            token,
            user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};