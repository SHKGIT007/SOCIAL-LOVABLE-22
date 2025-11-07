// Migration: Add lastRunAt, timezone, isPaused to schedules table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('schedules', 'lastRunAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('schedules', 'timezone', {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'Asia/Kolkata',
    });
    await queryInterface.addColumn('schedules', 'isPaused', {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('schedules', 'lastRunAt');
    await queryInterface.removeColumn('schedules', 'timezone');
    await queryInterface.removeColumn('schedules', 'isPaused');
  }
};
