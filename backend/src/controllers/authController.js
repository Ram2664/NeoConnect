const User = require("../models/User");
const generateToken = require("../utils/generateToken");

function buildAuthResponse(user) {
  return {
    token: generateToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    }
  };
}

async function register(req, res) {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Please enter a valid email address." });
      return;
    }

    // Validate password strength
    if (!password || password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters long." });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ message: "A user with that email already exists." });
      return;
    }

    const roleValue = role || "Staff";
    const isActiveValue = roleValue === "Admin"; // Auto-approve Admins so the system doesn't lock out the creator

    const user = await User.create({
      name,
      email,
      password,
      role: roleValue,
      department,
      isActive: isActiveValue
    });

    if (!user.isActive) {
      res.status(201).json({
        message: "Account created successfully. Please wait for an Admin to approve your account before logging in."
      });
      return;
    }

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Could not register user." });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: "Email or password is incorrect." });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ message: "Admin approval is pending. Contact IT support." });
      return;
    }

    res.json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Could not log in." });
  }
}

module.exports = {
  register,
  login
};
