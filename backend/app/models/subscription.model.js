// models/Subscription.js - COMPLETE FIXED VERSION
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "plans",
        key: "id",
      },
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      defaultValue: "success",
      allowNull: false,
    },
    amount_paid: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    payment_id: {
      type: DataTypes.STRING(255),
      allowNull: true, // ✅ NULL ALLOWED
      defaultValue: null,
    },
    order_id: {
      type: DataTypes.STRING(255),
      allowNull: true, // ✅ NULL ALLOWED
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "inactive",
        "cancelled",
        "expired",
        "pending"
      ),
      allowNull: false,
      defaultValue: "active",
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    posts_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ai_posts_used: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Subscription.associate = (models) => {
  Subscription.belongsTo(models.User, { foreignKey: "user_id", as: "User" });
  Subscription.belongsTo(models.Plan, { foreignKey: "plan_id", as: "Plan" });
};

module.exports = Subscription;
