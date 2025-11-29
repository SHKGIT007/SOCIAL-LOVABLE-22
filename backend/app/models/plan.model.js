const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Plan = sequelize.define(
  "Plan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    monthly_posts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ai_posts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    linked_accounts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // NEW FIELDS
    duration_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "plans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Plan.associate = (models) => {
  Plan.hasMany(models.Subscription, {
    foreignKey: "plan_id",
    as: "Subscriptions",
  });
};

module.exports = Plan;
