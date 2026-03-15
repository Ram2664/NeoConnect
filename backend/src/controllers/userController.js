const User = require("../models/User");

async function getUsers(req, res) {
  try {
    const query = {};

    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Could not load users." });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { role, department, isActive } = req.body;

    if (role) {
      user.role = role;
    }

    if (department) {
      user.department = department;
    }

    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: "Could not update user." });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Do not allow deleting the last Admin account to prevent locking out the system
    if (user.role === "Admin") {
      const adminCount = await User.countDocuments({ role: "Admin" });
      if (adminCount <= 1) {
        res.status(400).json({ message: "Cannot delete the last Admin account." });
        return;
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User securely removed from the system." });
  } catch (error) {
    res.status(500).json({ message: "Could not delete user." });
  }
}

module.exports = {
  getUsers,
  updateUser,
  deleteUser
};
