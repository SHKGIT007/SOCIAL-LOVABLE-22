const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const SystemSetting = sequelize.define(
  "SystemSetting",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // Unique type of setting
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Generic API configs
    api_key: { type: DataTypes.TEXT },
    api_url: { type: DataTypes.TEXT },

    // Active flag
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Cloudinary
    cloudinary_cloud_name: { type: DataTypes.TEXT },
    cloudinary_api_key: { type: DataTypes.TEXT },
    cloudinary_api_secret: { type: DataTypes.TEXT },

    // Google OAuth
    google_client_id: { type: DataTypes.TEXT },
    google_client_secret: { type: DataTypes.TEXT },

    // Facebook OAuth
    facebook_app_id: { type: DataTypes.TEXT },
    facebook_app_secret: { type: DataTypes.TEXT },
  },
  {
    tableName: "system_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = SystemSetting;
