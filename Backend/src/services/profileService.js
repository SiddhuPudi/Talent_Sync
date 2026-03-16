const prisma = require("../config/prisma");

async function createOrUpdateProfile(userId, data) {
    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    if(existingProfile) {
        return prisma.profile.update({
            where: { userId },
            data
        });
    }
    return prisma.profile.create({
        data: {
            ...data,
            userId
        }
    });
}

async function getProfile(userId) {
    return prisma.profile.findUnique({ where: { userId } });
}

module.exports = {
    createOrUpdateProfile,
    getProfile
}