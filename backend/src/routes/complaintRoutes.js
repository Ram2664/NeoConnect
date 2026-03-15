const express = require("express");
const upload = require("../config/upload");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint
} = require("../controllers/complaintController");

const router = express.Router();

router.post("/complaints", protect, allowRoles("Staff"), upload.single("file"), createComplaint);
router.get("/complaints", protect, getComplaints);
router.get("/complaints/:id", protect, getComplaintById);
router.patch(
  "/complaints/:id",
  protect,
  allowRoles("Secretariat", "Case Manager"),
  updateComplaint
);

module.exports = router;
