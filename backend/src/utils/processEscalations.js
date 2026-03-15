const Complaint = require("../models/Complaint");

async function processEscalations() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const overdueComplaints = await Complaint.find({
    assignedTo: { $ne: null },
    status: { $in: ["Assigned", "In Progress", "Pending"] },
    $or: [
      {
        lastCaseManagerActionAt: { $lte: sevenDaysAgo }
      },
      {
        lastCaseManagerActionAt: null,
        assignedAt: { $lte: sevenDaysAgo }
      }
    ]
  });

  for (const complaint of overdueComplaints) {
    complaint.reminderSentAt = new Date();
    complaint.status = "Escalated";
    complaint.escalatedAt = new Date();
    complaint.notes.push({
      message:
        "System reminder sent. No case manager response for 7 days, so the case was escalated automatically.",
      addedByName: "NeoConnect System",
      addedByRole: "System",
      isSystem: true
    });

    await complaint.save();
  }

  return overdueComplaints.length;
}

module.exports = processEscalations;
