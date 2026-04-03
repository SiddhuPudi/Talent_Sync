const authService = require("../services/authService");
const generateToken = require("../utils/generateToken");

exports.registerUser = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await authService.verifyOtp(email, otp);
        const token = generateToken(user.id);
        res.status(200).json({
            token,
            user
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};