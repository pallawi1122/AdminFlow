
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// HOME ROUTE
// ===============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to AdminFlow API"
  });
});

// ===============================
// HEALTH CHECK ROUTE
// ===============================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AdminFlow Server is running successfully"
  });
});

// ===============================
// AUTHENTICATION ROUTES
// ===============================

app.use("/api/auth", authRoutes);

// Registration:
// POST /api/auth/register

// Login:
// POST /api/auth/login


// ===============================
// USER ROUTES
// ===============================

app.use("/api/users", userRoutes);

// User Profile:
// GET /api/users/me


// ===============================
// ADMIN ROUTES
// ===============================

app.use("/api/admin", adminRoutes);

// Get All Users:
// GET /api/admin/users

// Create User:
// POST /api/admin/users

// Update User:
// PUT /api/admin/users/:id

// Delete User:
// DELETE /api/admin/users/:id


// ===============================
// 404 NOT FOUND HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ===============================
// SERVER START
// ===============================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("AdminFlow Backend Started");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("MongoDB: Connected Successfully");
      console.log("--------------------------------");
    });

  } catch (error) {
    console.error("Server Startup Error:", error.message);
    process.exit(1);
  }
};

startServer();
