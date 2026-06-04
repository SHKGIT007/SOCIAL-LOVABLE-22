module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      platforms: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      days: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      times: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      recurrence: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customDateFrom: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      customDateTo: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      singleDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('schedules');
  },
};
