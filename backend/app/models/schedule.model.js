const { DataTypes } = require('sequelize');

const sequelize = require('../config/db.config');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  platforms: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  days: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  times: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
  recurrence: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  customDateFrom: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  customDateTo: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  singleDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
        type: DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '1',
   },
  lastRunAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Asia/Kolkata',
  },
  isPaused: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'schedules',
  timestamps: true,
});

Schedule.associate = (models) => {
  Schedule.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = Schedule;
