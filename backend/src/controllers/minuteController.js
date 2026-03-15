const MeetingMinute = require("../models/MeetingMinute");

async function createMinute(req, res) {
  try {
    const { title, quarter, meetingDate } = req.body;

    if (!req.file || req.file.mimetype !== "application/pdf") {
      res.status(400).json({ message: "Please upload a PDF file for meeting minutes." });
      return;
    }

    const minute = await MeetingMinute.create({
      title,
      quarter,
      meetingDate,
      pdfUrl: `/uploads/${req.file.filename}`,
      pdfName: req.file.originalname,
      uploadedBy: req.user._id
    });

    res.status(201).json(minute);
  } catch (error) {
    res.status(500).json({ message: "Could not upload meeting minutes." });
  }
}

async function getMinutes(req, res) {
  try {
    const minutes = await MeetingMinute.find()
      .populate("uploadedBy", "name role")
      .sort({ meetingDate: -1 });

    res.json(minutes);
  } catch (error) {
    res.status(500).json({ message: "Could not load meeting minutes." });
  }
}

module.exports = {
  createMinute,
  getMinutes
};
