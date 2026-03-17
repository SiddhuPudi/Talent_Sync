const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const apiLimiter = require("./middlewares/rateLimiter");
const requestLogger = require("./middlewares/requestLogger");
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/api", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use(errorMiddleware);
app.get("/", (req, res) => {
  res.send("LinkedIn Lite Backend Running");
});

module.exports = app;