const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;

// Only use Redis store when REDIS_URL is configured
let redisClient = null;
let RedisStore = null;

if (process.env.REDIS_URL) {
    try {
        RedisStore = (require("rate-limit-redis").default || require("rate-limit-redis"));
        const { createClient } = require("redis");
        redisClient = createClient({ url: process.env.REDIS_URL });
        redisClient.connect().catch(console.error);
    } catch (e) {
        console.warn("⚠️  rate-limit-redis not available, using memory store");
    }
}

function createStore(prefix) {
    if (redisClient && RedisStore) {
        return new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: `rl:${prefix}:`,
        });
    }
    // Fall back to in-memory store (default)
    return undefined;
}

// Use ipKeyGenerator to handle IPv6 correctly, combined with user ID when available
function userKeyGenerator(req) {
    const userId = req.user?.id;
    const ip = ipKeyGenerator(req);
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