const mongoose = require("mongoose");

const complaintStatuses = [
  "New",
  "Assigned",
  "In Progress",
  "Pending",
  "Resolved",
  "Escalated"
];

const noteSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    addedByName: {
      type: String,
      default: "System"
    },
    addedByRole: {
      type: String,
      default: "System"
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["Safety", "Policy", "Facilities", "HR", "Other"],
      required: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    attachmentUrl: {
      type: String,
      default: ""
    },
    attachmentName: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: complaintStatuses,
      default: "New"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    assignedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    },
    publicUpdate: {
      type: String,
      default: ""
    },
    notes: [noteSchema],
    lastCaseManagerActionAt: {
      type: Date
    },
    reminderSentAt: {
      type: Date
    },
    escalatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.pre("save", async function buildTrackingId(next) {
  if (!this.isNew || this.trackingId) {
    next();
    return;
  }

  const year = new Date().getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const count = await this.constructor.countDocuments({
    createdAt: {
      $gte: yearStart,
      $lt: yearEnd
    }
  });

  this.trackingId = `NEO-${year}-${String(count + 1).padStart(3, "0")}`;
  next();
});

module.exports = mongoose.model("Complaint", complaintSchema);
