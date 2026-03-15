const SystemSetting = require("../models/SystemSetting");

const defaultSettings = [
  {
    key: "escalationDays",
    label: "Escalation days",
    value: "7"
  },
  {
    key: "allowAnonymous",
    label: "Allow anonymous complaints",
    value: "true"
  }
];

async function ensureDefaultSettings() {
  for (const setting of defaultSettings) {
    await SystemSetting.findOneAndUpdate(
      { key: setting.key },
      {
        $setOnInsert: setting
      },
      {
        new: true,
        upsert: true
      }
    );
  }
}

async function getSettings(req, res) {
  try {
    await ensureDefaultSettings();
    const settings = await SystemSetting.find().sort({ key: 1 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Could not load settings." });
  }
}

async function updateSettings(req, res) {
  try {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
      res.status(400).json({ message: "Settings list is required." });
      return;
    }

    const savedSettings = [];

    for (const item of settings) {
      const updatedSetting = await SystemSetting.findOneAndUpdate(
        { key: item.key },
        {
          key: item.key,
          label: item.label,
          value: String(item.value),
          updatedBy: req.user._id
        },
        {
          new: true,
          upsert: true
        }
      );

      savedSettings.push(updatedSetting);
    }

    res.json(savedSettings);
  } catch (error) {
    res.status(500).json({ message: "Could not update settings." });
  }
}

module.exports = {
  getSettings,
  updateSettings
};
