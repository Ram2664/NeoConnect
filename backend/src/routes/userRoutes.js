const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getUsers, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();

router.get("/users", protect, allowRoles("Secretariat", "Admin"), getUsers);
router.patch("/users/:id", protect, allowRoles("Admin"), updateUser);
router.delete("/users/:id", protect, allowRoles("Admin"), deleteUser);

module.exports = router;
