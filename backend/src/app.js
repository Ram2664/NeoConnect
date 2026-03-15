const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const pollRoutes = require("./routes/pollRoutes");
const minuteRoutes = require("./routes/minuteRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", function healthCheck(req, res) {
  res.json({ message: "NeoConnect API is running" });
});

app.use(authRoutes);
app.use(complaintRoutes);
app.use(pollRoutes);
app.use(minuteRoutes);
app.use(analyticsRoutes);
app.use(userRoutes);
app.use(settingsRoutes);

app.use(function errorHandler(error, req, res, next) {
  console.error(error);
  res.status(500).json({
    message: error.message || "Something went wrong on the server."
  });
});

module.exports = app;
