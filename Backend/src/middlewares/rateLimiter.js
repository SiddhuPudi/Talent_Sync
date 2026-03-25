const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default || require("rate-limit-redis");
const { createClient } = require("redis");

// Utilize existing Redis config or fallback
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379"
});
redisClient.connect().catch(console.error);

const defaultStore = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
});

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // 10 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    store: defaultStore,
    message: { success: false, message: "Too many auth attempts. Try again in 10 minutes." }
});

const readLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Very relaxed reading (GET)
    standardHeaders: true,
    legacyHeaders: false,
    store: defaultStore,
    message: { success: false, message: "Too many requests. Slow down." }
});

const writeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // Moderate writes (POST/PUT/PATCH/DELETE)
    standardHeaders: true,
    legacyHeaders: false,
    store: defaultStore,
    message: { success: false, message: "Too many modifications. Try again later." }
});

module.exports = { authLimiter, readLimiter, writeLimiter };