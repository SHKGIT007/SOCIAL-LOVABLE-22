const Profile = require('../models/profile.model');
const { User } = require('../models');

// Get profile for logged-in user
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (!profile) return res.status(404).json({ status: false, message: 'Profile not found' });
    res.json({ status: true, data: { profile } });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

// Create or update profile for logged-in user
exports.saveProfile = async (req, res) => {
  try {
    const { business_name, description, platforms, brand_voice, hashtags, image_style } = req.body;
    let profile = await Profile.findOne({ where: { user_id: req.user.id } });
    if (profile) {
      await profile.update({ business_name, description, platforms, brand_voice, hashtags, image_style });
    } else {
      profile = await Profile.create({ user_id: req.user.id, business_name, description, platforms, brand_voice, hashtags, image_style });
    }
    res.json({ status: true, data: { profile } });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
