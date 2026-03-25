const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
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

const pubClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
const subClient = pubClient.duplicate();

(async () => {
  await pubClient.connect();
  await subClient.connect();
})();

io.adapter(createAdapter(pubClient, subClient));

require("./src/sockets/chatSocket")(io);

(async () => {
  try {
    await connectProducer();
    await startConsumer();
  } catch (err) {
    console.error("Failed to start Kafka services:", err);
  }
})();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});