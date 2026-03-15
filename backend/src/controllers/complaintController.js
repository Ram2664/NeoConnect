const Complaint = require("../models/Complaint");

function hideAnonymousReporter(complaint) {
  const complaintData = complaint.toObject ? complaint.toObject() : complaint;

  if (complaintData.anonymous) {
    complaintData.createdBy = {
      name: "Anonymous Staff",
      role: "Staff"
    };
  }

  return complaintData;
}

async function createComplaint(req, res) {
  try {
    const {
      title,
      description,
      category,
      department,
      location,
      severity,
      anonymous
    } = req.body;

    const anonymousValue = anonymous === true || anonymous === "true";

    const complaint = await Complaint.create({
      title,
      description,
      category,
      department,
      location,
      severity,
      anonymous: anonymousValue,
      attachmentUrl: req.file ? `/uploads/${req.file.filename}` : "",
      attachmentName: req.file ? req.file.originalname : "",
      createdBy: req.user._id,
      notes: [
        {
          message: "Complaint submitted and waiting for review.",
          addedBy: req.user._id,
          addedByName: anonymousValue ? "Anonymous Staff" : req.user.name,
          addedByRole: req.user.role
        }
      ]
    });

    const savedComplaint = await Complaint.findById(complaint._id)
      .populate("createdBy", "name email role department")
      .populate("assignedTo", "name email role department");

    res.status(201).json(hideAnonymousReporter(savedComplaint));
  } catch (error) {
    res.status(500).json({ message: "Could not create complaint." });
  }
}

async function getComplaints(req, res) {
  try {
    const query = {};

    if (req.user.role === "Staff") {
      query.createdBy = req.user._id;
    }

    if (req.user.role === "Case Manager") {
      query.assignedTo = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate("createdBy", "name email role department")
      .populate("assignedTo", "name email role department")
      .sort({ createdAt: -1 });

    res.json(complaints.map(hideAnonymousReporter));
  } catch (error) {
    res.status(500).json({ message: "Could not load complaints." });
  }
}

async function getComplaintById(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("createdBy", "name email role department")
      .populate("assignedTo", "name email role department")
      .populate("assignedBy", "name email role");

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found." });
      return;
    }

    if (
      req.user.role === "Staff" &&
      String(complaint.createdBy?._id || complaint.createdBy) !== String(req.user._id)
    ) {
      res.status(403).json({ message: "You can only view your own complaints." });
      return;
    }

    if (
      req.user.role === "Case Manager" &&
      String(complaint.assignedTo?._id || complaint.assignedTo) !== String(req.user._id)
    ) {
      res.status(403).json({ message: "You can only view assigned cases." });
      return;
    }

    res.json(hideAnonymousReporter(complaint));
  } catch (error) {
    res.status(500).json({ message: "Could not load complaint." });
  }
}

async function updateComplaint(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      res.status(404).json({ message: "Complaint not found." });
      return;
    }

    if (
      req.user.role === "Case Manager" &&
      String(complaint.assignedTo) !== String(req.user._id)
    ) {
      res.status(403).json({ message: "This case is not assigned to you." });
      return;
    }

    const { assignedTo, status, note, publicUpdate } = req.body;

    if (assignedTo) {
      if (req.user.role !== "Secretariat") {
        res.status(403).json({ message: "Only Secretariat can assign cases." });
        return;
      }

      // Prevent reassignment if case manager is already assigned
      if (complaint.assignedTo) {
        res.status(403).json({ message: "Case is already assigned to a case manager and cannot be reassigned." });
        return;
      }

      complaint.assignedTo = assignedTo;
      complaint.assignedBy = req.user._id;
      complaint.assignedAt = new Date();
      complaint.status = "Assigned";
      complaint.notes.push({
        message: "Complaint assigned to a case manager.",
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedByRole: req.user.role
      });
    }

    if (status || note || publicUpdate !== undefined) {
      if (req.user.role !== "Case Manager") {
        res.status(403).json({ message: "Only Case Managers can update interactions on an assigned case." });
        return;
      }
    }

    if (typeof publicUpdate === "string") {
      complaint.publicUpdate = publicUpdate;
    }

    if (status) {
      // Define the exact case lifecycle as per requirements
      const validTransitions = {
        "New": ["Assigned"], // Secretariat assigns to Case Manager
        "Assigned": ["In Progress", "Escalated"], // Case Manager starts work or escalates
        "In Progress": ["Pending", "Resolved", "Escalated"], // Case Manager can pause, resolve, or escalate
        "Pending": ["In Progress", "Resolved", "Escalated"], // Case Manager can resume, resolve, or escalate
        "Resolved": [], // Final state - no further transitions
        "Escalated": ["Resolved"] // Management can only resolve escalated cases
      };

      const allowedNextStatuses = validTransitions[complaint.status] || [];
      
      if (!allowedNextStatuses.includes(status)) {
        res.status(400).json({ 
          message: `Cannot change status from "${complaint.status}" to "${status}". Valid next statuses are: ${allowedNextStatuses.join(", ") || "None (case is complete)"}.` 
        });
        return;
      }

      // Update status
      complaint.status = status;

      // Set timestamps for specific status changes
      if (status === "Escalated") {
        complaint.escalatedAt = new Date();
      }
      
      if (status === "Resolved") {
        complaint.closedAt = new Date();
      }

      if (req.user.role === "Case Manager") {
        complaint.lastCaseManagerActionAt = new Date();
      }

      // Add status change note with proper description
      let statusMessage = `Status changed to ${status}.`;
      if (status === "Assigned") {
        statusMessage = "Case assigned to Case Manager for review and action.";
      } else if (status === "In Progress") {
        statusMessage = "Case Manager is actively working on this case.";
      } else if (status === "Pending") {
        statusMessage = "Case is waiting for more information from the staff member.";
      } else if (status === "Resolved") {
        statusMessage = "Case has been addressed and closed.";
      } else if (status === "Escalated") {
        statusMessage = "Case escalated to management due to 7-day rule or complexity.";
      }

      complaint.notes.push({
        message: statusMessage,
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedByRole: req.user.role
      });
    }

    if (note) {
      complaint.notes.push({
        message: note,
        addedBy: req.user._id,
        addedByName: req.user.name,
        addedByRole: req.user.role
      });

      if (req.user.role === "Case Manager") {
        complaint.lastCaseManagerActionAt = new Date();
      }
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate("createdBy", "name email role department")
      .populate("assignedTo", "name email role department")
      .populate("assignedBy", "name email role");

    res.json(hideAnonymousReporter(updatedComplaint));
  } catch (error) {
    res.status(500).json({ message: "Could not update complaint." });
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint
};
