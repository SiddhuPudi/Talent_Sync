const app = require("./src/app");
const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

require("./src/sockets/chatSocket")(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});