// Migration: Add scheduleId column and index to posts table
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('posts', 'scheduleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addIndex('posts', ['scheduleId'], {
      name: 'idx_scheduleId',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('posts', 'idx_scheduleId');
    await queryInterface.removeColumn('posts', 'scheduleId');
  }
};
