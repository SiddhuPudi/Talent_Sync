const profileService = require("../services/profileService");

exports.updateProfile = async (req, res) => {
    try {
        const profile = await profileService.createOrUpdateProfile(
            req.user.id,
            req.body
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const profile = await profileService.getProfile(req.user.id);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};