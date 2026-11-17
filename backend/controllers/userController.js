
const User = require("../models/User");

// GET LOGGED-IN USER PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user
    });

  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
};

module.exports = {
  getMyProfile
};
