const express = require("express");
const upload = require("../config/upload");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { createMinute, getMinutes } = require("../controllers/minuteController");

const router = express.Router();

router.post("/minutes", protect, allowRoles("Secretariat"), upload.single("file"), createMinute);
router.get("/minutes", getMinutes);

module.exports = router;
