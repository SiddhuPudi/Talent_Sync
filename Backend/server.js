const app = require("./src/app");
const http = require("http");
const client = require("prom-client");
const { Server } = require("socket.io");
const { connectProducer } = require("./src/services/kafkaProducer");
const { startConsumer } = require("./src/services/kafkaConsumer");

// collect default metrics (CPU, memory, etc.)
client.collectDefaultMetrics();

// custom HTTP request counter
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});
app.set("io", io);

if (process.env.REDIS_URL) {
  const { createAdapter } = require("@socket.io/redis-adapter");
  const { createClient } = require("redis");
  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  (async () => {
    try {
      await pubClient.connect();
      await subClient.connect();
      io.adapter(createAdapter(pubClient, subClient));
      console.log("✅ Socket.IO Redis adapter enabled");
    } catch (err) {
      console.error("❌ Redis adapter error:", err);
    }
  })();
} else {
  console.log("⚠️ Running Socket.IO without Redis");
}

require("./src/sockets/chatSocket")(io);

if (process.env.KAFKA_BROKER) {
  (async () => {
    try {
      await connectProducer();
      await startConsumer();
      console.log("✅ Kafka services started");
    } catch (err) {
      console.error("❌ Kafka error:", err);
    }
  })();
} else {
  console.log("⚠️ Kafka disabled (no KAFKA_BROKER)");
}

// middleware to track requests
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });
  });
  next();
});

// metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});