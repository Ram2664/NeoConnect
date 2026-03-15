const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { createPoll, getPolls, votePoll } = require("../controllers/pollController");

const router = express.Router();

router.post("/polls", protect, allowRoles("Secretariat"), createPoll);
router.get("/polls", protect, getPolls);
router.post("/polls/vote", protect, allowRoles("Staff", "Case Manager"), votePoll);

module.exports = router;
