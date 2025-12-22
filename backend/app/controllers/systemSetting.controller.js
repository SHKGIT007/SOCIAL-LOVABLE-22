const { SystemSetting } = require('../models');

// Get all system settings
exports.getSystemSettings = async (req, res) => {
  const settings = await SystemSetting.findAll();
  res.json({ status: true, data: settings });
};

// Get AI Provider credentials
exports.getAIProviderCredentials = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { id: 1 } });
    if (!setting) {
      return res.json({ 
        status: true, 
        data: { 
          type: '', 
          api_url: '', 
          api_key: '', 
          is_active: false 
        } 
      });
    }
    res.json({ 
      status: true, 
      data: { 
        type: setting.type || '', 
        api_url: setting.api_url || '', 
        api_key: setting.api_key || '', 
        is_active: setting.is_active || false 
      } 
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get Cloudinary credentials
exports.getCloudinaryCredentials = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { id: 1 } });
    if (!setting) {
      return res.json({ 
        status: true, 
        data: { 
          cloudinary_cloud_name: '', 
          cloudinary_api_key: '', 
          cloudinary_api_secret: '' 
        } 
      });
    }
    res.json({ 
      status: true, 
      data: { 
        cloudinary_cloud_name: setting.cloudinary_cloud_name || '', 
        cloudinary_api_key: setting.cloudinary_api_key || '', 
        cloudinary_api_secret: setting.cloudinary_api_secret || '' 
      } 
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Get Google OAuth credentials
exports.getGoogleOAuthCredentials = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ where: { id: 1 } });
    if (!setting) {
      return res.json({ 
        status: true, 
        data: { 
          google_client_id: '', 
          google_client_secret: '', 
          google_redirect_uri: '' 
        } 
      });
    }
    res.json({ 
      status: true, 
      data: { 
        google_client_id: setting.google_client_id || '', 
        google_client_secret: setting.google_client_secret || '', 
        google_redirect_uri: setting.google_redirect_uri || '' 
      } 
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Update system settings (bulk)
exports.updateSystemSettings = async (req, res) => {
  const updates = req.body.settings; // {type, api_url, api_key, ...}
  let type = updates.type;
  let is_active = updates.is_active;
  let api_url = updates.api_url;
  let api_key = updates.api_key;
  let cloudinary_cloud_name = updates.cloudinary_cloud_name;
  let cloudinary_api_key = updates.cloudinary_api_key;
  let cloudinary_api_secret = updates.cloudinary_api_secret;
  let google_client_id = updates.google_client_id;
  let google_client_secret = updates.google_client_secret;
  let google_redirect_uri = updates.google_redirect_uri;

  // Only single record exists for system settings
  const [affectedRows] = await SystemSetting.update(
    {
      type,
      is_active,
      api_url,
      api_key,
      cloudinary_cloud_name,
      cloudinary_api_key,
      cloudinary_api_secret,
      google_client_id,
      google_client_secret,
      google_redirect_uri
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
      cloudinary_api_secret,
      google_client_id,
      google_client_secret,
      google_redirect_uri
    });
  }
  res.json({ status: true, message: 'Settings updated successfully' });
};
