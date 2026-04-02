let redisClient = null;
if (process.env.REDIS_URL) {
    const { createClient } = require("redis");
    redisClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379"
    });
    redisClient.connect()
        .then(() => console.log("✅ Redis Connected."))
        .catch((err) => console.error("❌ Redis Connection Error:", err));
} else {
    console.log("⚠️ Redis Disabled (No REDIS_URL)");
}
module.exports = redisClient;