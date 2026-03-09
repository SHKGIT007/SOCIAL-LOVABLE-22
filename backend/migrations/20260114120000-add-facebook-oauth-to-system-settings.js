'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const table = await queryInterface.describeTable('system_settings');
      
      const changes = [];
      
      if (!table.facebook_app_id) {
        changes.push(
          queryInterface.addColumn('system_settings', 'facebook_app_id', {
            type: Sequelize.TEXT,
            allowNull: true,
          })
        );
      }
      
      if (!table.facebook_app_secret) {
        changes.push(
          queryInterface.addColumn('system_settings', 'facebook_app_secret', {
            type: Sequelize.TEXT,
            allowNull: true,
          })
        );
      }
      
      if (changes.length > 0) {
        await Promise.all(changes);
      } else {
      }
    } catch (error) {
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const table = await queryInterface.describeTable('system_settings');
      
      const changes = [];
      
      if (table.facebook_app_id) {
        changes.push(
          queryInterface.removeColumn('system_settings', 'facebook_app_id')
        );
      }
      
      if (table.facebook_app_secret) {
        changes.push(
          queryInterface.removeColumn('system_settings', 'facebook_app_secret')
        );
      }
      
      if (changes.length > 0) {
        await Promise.all(changes);
      }
    } catch (error) {
      throw error;
    }
  }
};
