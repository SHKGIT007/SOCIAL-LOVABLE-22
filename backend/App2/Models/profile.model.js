const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Profile = sequelize.define('Profile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  business_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  platforms: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  brand_voice: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hashtags: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image_style: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

Profile.associate = (models) => {
  Profile.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
};

module.exports = Profile;
