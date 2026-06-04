const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PostSchedule = sequelize.define('PostSchedule', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // can be null for auto-generated posts
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    platforms: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        const raw = this.getDataValue('platforms');
        return raw ? raw.split(',') : [];
      },
      set(val) {
        this.setDataValue('platforms', Array.isArray(val) ? val.join(',') : val);
      },
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    recurrence: {
      type: DataTypes.STRING,
      allowNull: true, // e.g., 'none', 'daily', 'weekly', 'custom'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending', // pending, completed, failed
    },
    last_run_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'post_schedules',
    timestamps: true,
  });

  return PostSchedule;
};
