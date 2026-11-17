
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/adminUserController");

// All Admin routes require authentication
router.use(protect, adminOnly);

// Get all users
router.get("/users", getAllUsers);

// Create new user
router.post("/users", createUser);

// Update user
router.put("/users/:id", updateUser);

// Delete user
router.delete("/users/:id", deleteUser);

module.exports = router;
