const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default || require("rate-limit-redis");
const { createClient } = require("redis");

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.connect().catch(console.error);


function createStore(prefix) {
    return new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: `rl:${prefix}:`,
    });
}


function userKeyGenerator(req) {
    const userId = req.user?.id;
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    return userId ? `user_${userId}_${ip}` : ip;
}

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("auth"),
    message: { success: false, message: "Too many auth attempts. Try again in 15 minutes." },
    skipSuccessfulRequests: true, 
});

const readLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("read"),
    keyGenerator: userKeyGenerator,
    message: { success: false, message: "Too many requests. Please slow down." },
});

const writeLimiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("write"),
    keyGenerator: userKeyGenerator,
    message: { success: false, message: "Too many modifications. Try again shortly." },
});

module.exports = { authLimiter, readLimiter, writeLimiter };