const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env" });
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const { authLimiter, readLimiter, writeLimiter } = require("./middlewares/rateLimiter");
const requestLogger = require("./middlewares/requestLogger");
const path = require("path");
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://talent-sync-green.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));
app.options("/*splat", cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(requestLogger);

app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth")) {
        return next();
    }
    if (req.method === "GET") {
        return readLimiter(req, res, next);
    }
    return writeLimiter(req, res, next);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorMiddleware);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
  res.send("Talent Sync Backend Running");
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
module.exports = app;