const Complaint = require("../models/Complaint");

async function getAnalytics(req, res) {
  try {
    const openDepartments = await Complaint.aggregate([
      {
        $match: { status: { $ne: "Resolved" } }
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalDepartments = await Complaint.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const categories = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const statuses = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const hotSpots = await Complaint.aggregate([
      {
        $group: {
          _id: {
            department: "$department",
            category: "$category"
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gte: 5 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      openDepartments: openDepartments.map((item) => ({
        label: item._id,
        count: item.count
      })),
      departments: totalDepartments.map((item) => ({
        label: item._id,
        count: item.count
      })),
      categories: categories.map((item) => ({
        label: item._id,
        count: item.count
      })),
      statuses: statuses.map((item) => ({
        label: item._id,
        count: item.count
      })),
      hotSpots: hotSpots.map((item) => ({
        department: item._id.department,
        category: item._id.category,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load analytics." });
  }
}

module.exports = {
  getAnalytics
};
