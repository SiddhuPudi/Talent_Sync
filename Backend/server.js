const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

(async () => {
  await pubClient.connect();
  await subClient.connect();
})();

io.adapter(createAdapter(pubClient, subClient));

require("./src/sockets/chatSocket")(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});