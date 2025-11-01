const { SystemSetting } = require('../models');

// Get all system settings
exports.getSystemSettings = async (req, res) => {
  const settings = await SystemSetting.findAll();
  res.json({ status: true, data: settings });
};

// Update system settings (bulk)
exports.updateSystemSettings = async (req, res) => {
  const updates = req.body.settings; // [{key, value, ...}]
  for (const item of updates) {
    await SystemSetting.upsert(item, { where: { key: item.key } });
  }
  res.json({ status: true, message: 'Settings updated' });
};
