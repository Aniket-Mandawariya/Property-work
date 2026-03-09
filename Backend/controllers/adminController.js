const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Check if body exists
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Find admin in database
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({
        message: "Admin not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid password"
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
