const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_fname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_lname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    user_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_type: {
      type: DataTypes.ENUM("admin", "client"),
      allowNull: true,
      defaultValue: "client",
    },
    is_admin: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "off",
    },
    active_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "id",
      },
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

User.associate = (models) => {
  User.belongsTo(models.Role, { foreignKey: "role_id", as: "Role" });
  User.hasMany(models.Post, { foreignKey: "user_id", as: "Posts" });
  User.hasMany(models.Subscription, {
    foreignKey: "user_id",
    as: "Subscriptions",
  });
  User.hasMany(models.SocialAccount, {
    foreignKey: "user_id",
    as: "SocialAccounts",
  });
};

module.exports = User;
