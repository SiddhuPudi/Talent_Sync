const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const { connectProducer } = require("./src/services/kafkaProducer");
const { startConsumer } = require("./src/services/kafkaConsumer");

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});