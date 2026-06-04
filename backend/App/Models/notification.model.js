const { DataTypes } = require("sequelize");
const sequelize = require("../Connection/db.config");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // For user notifications (if for_user_id is set, it's for that user)
    for_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    // For admin notifications (if for_admin is true, it's for admin panel)
    for_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // Type of notification for filtering
    notification_type: {
      type: DataTypes.ENUM(
        "user_registered",
        "plan_purchase",
        "post_created",
        "post_published",
        "post_scheduled",
        "post_pending_review",
        "post_draft",
        "ai_limit_alert",
        "schedule_reminder",
        "draft_reminder"
      ),
      allowNull: false,
    },
    // Main content
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Related data (JSON) - store user_id, post_id, etc for quick access
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
    },
    // Read status
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  }
);

Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: "for_user_id",
    as: "User",
  });
};

module.exports = Notification;

