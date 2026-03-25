const profileService = require("../services/profileService");
const prisma = require("../config/prisma");

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

exports.getProfileStats = async (req, res) => {
    try {
        const targetId = req.params.id === 'me' ? req.user.id : (isNaN(req.params.id) ? req.params.id : Number(req.params.id));
        
        const connectionsCount = await prisma.connection.count({
            where: {
                OR: [{ senderId: targetId }, { receiverId: targetId }],
                status: 'accepted'
            }
        });
        const applicationsCount = await prisma.application.count({
            where: { applicantId: targetId }
        });

        res.json({
            views: Math.floor(Math.random() * 500), // Derive normally if schema is created
            applied: applicationsCount,
            saved: 0, // Placeholder schema
            searchAppr: Math.floor(Math.random() * 50),
            connections: connectionsCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}