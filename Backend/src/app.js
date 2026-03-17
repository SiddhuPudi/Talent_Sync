const express = require("express");
const cors = require("cors");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const apiLimiter = require("./middlewares/rateLimiter");
const requestLogger = require("./middlewares/requestLogger");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api", apiLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/connections", connectionRoutes);
app.use(errorMiddleware);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
  res.send("Talent Sync Backend Running");
});

module.exports = app;