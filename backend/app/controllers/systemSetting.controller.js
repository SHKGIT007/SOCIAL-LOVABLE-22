const { SystemSetting } = require('../models');

// Get all system settings
exports.getSystemSettings = async (req, res) => {
  const settings = await SystemSetting.findAll();
  res.json({ status: true, data: settings });
};

// Update system settings (bulk)
exports.updateSystemSettings = async (req, res) => {
  const updates = req.body.settings; // [{key, value, ...}]
  let type = updates.settings.type;
  let is_active = updates.settings.is_active;
  let api_url = updates.settings.api_url;
  let api_key = updates.settings.api_key;
  let cloudinary_cloud_name = updates.settings.cloudinary_cloud_name;
  let cloudinary_api_key = updates.settings.cloudinary_api_key;
  let cloudinary_api_secret = updates.settings.cloudinary_api_secret;

  // Only single record exists for system settings
  const [affectedRows] = await SystemSetting.update(
    {
      type,
      is_active,
      api_url,
      api_key,
      cloudinary_cloud_name,
      cloudinary_api_key,
      cloudinary_api_secret
    },
    { where: { id: 1 } }
  );

  // If no record was updated, insert a new one
  if (affectedRows === 0) {
    await SystemSetting.create({
      id: 1,
      type,
      is_active,
      api_url,
      api_key,
      cloudinary_cloud_name,
      cloudinary_api_key,
      cloudinary_api_secret
    });
  }
  res.json({ status: true, message: 'Settings updated' });
};
