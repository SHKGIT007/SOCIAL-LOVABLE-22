const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

// SystemSetting model for AI provider and Cloudinary settings
const SystemSetting = sequelize.define(
  "SystemSetting",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // Type of setting: 'ai-provider', 'cloudinary', etc.
    type: { type: DataTypes.STRING },
    // Unique key for the setting
    api_key: { type: DataTypes.TEXT },
    // Value for generic settings (API key, etc.)
    api_url: { type: DataTypes.TEXT },
    // Is this setting active?
    is_active: { type: DataTypes.BOOLEAN },
    // Cloudinary specific fields
    cloudinary_cloud_name: { type: DataTypes.TEXT },
    cloudinary_api_key: { type: DataTypes.TEXT },
    cloudinary_api_secret: { type: DataTypes.TEXT },
    google_client_id: { type: DataTypes.TEXT },
    google_client_secret: { type: DataTypes.TEXT },
    google_redirect_uri: { type: DataTypes.TEXT },
  },
  {
    tableName: "system_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = SystemSetting;
