const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getSettings, updateSettings } = require("../controllers/settingsController");

const router = express.Router();

router.get("/settings", protect, allowRoles("Admin"), getSettings);
router.patch("/settings", protect, allowRoles("Admin"), updateSettings);

module.exports = router;
