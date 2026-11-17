
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getMyProfile } = require("../controllers/userController");

// Protected Profile API
router.get("/me", protect, getMyProfile);

module.exports = router;
