const mongoose = require("mongoose");

const meetingMinuteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    quarter: {
      type: String,
      required: true,
      trim: true
    },
    meetingDate: {
      type: Date,
      required: true
    },
    pdfUrl: {
      type: String,
      required: true
    },
    pdfName: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MeetingMinute", meetingMinuteSchema);
