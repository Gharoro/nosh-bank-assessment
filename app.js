const express = require("express");
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");

const AuthRouter = require("./routes/api/v1/Auth");
const UserRouter = require("./routes/api/v1/User");
const connectDB = require("./config/database");

// Load env vars
dotenv.config();
// Connect to database
connectDB();
// Initialize rate limiter
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // Maximum number of requests per 5 minutes
});

// Initialize express app
const app = express();
const server = http.createServer(app);
// Initialize middlewares
app.use(cors());
app.use(limiter);
app.use(express.json());
app.use(cookieParser());
// Mount routes
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/user", UserRouter);
// Ping route
app.get("/", function (req, res) {
    res.send("API V1 is live!");
});

const PORT = process.env.PORT || 9090;

server.listen(PORT, function () {
    console.log(`Server running on port:${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", function (err, promise) {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(function () {
        process.exit(1);
    });
});

module.exports = server;
