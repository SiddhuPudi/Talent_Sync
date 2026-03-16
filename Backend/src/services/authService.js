const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

async function registerUser(data) {
    const { name, email, password } = data;
    const exisitingUser = await prisma.user.findUnique({ where: { email } });
    if (exisitingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    });
    return user;
}

async function loginUser(data) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error("Invalid credentials");
    }
    return user;
}

module.exports = {
    registerUser,
    loginUser
};