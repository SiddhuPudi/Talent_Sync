const prisma = require("../config/prisma");

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.json(user);
    } catch(e) { res.status(500).json({ error: e.message }); }
}

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: q,
                    mode: 'insensitive' // Requires PG
                }
            },
            select: { id: true, name: true, role: true }
        });
        res.json(users);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getUserById = async (req, res) => {
    try {
        // Assume ID strings drop safely, parse against model strictly
        const targetId = isNaN(req.params.id) ? req.params.id : Number(req.params.id);
        const user = await prisma.user.findUnique({
            where: { id: targetId },
            select: { id: true, name: true, email: true, createdAt: true }
        });
        if(!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (e) { res.status(500).json({ error: e.message }); }
};