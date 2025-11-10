const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'social_lovable',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true
        },

        timezone: '+05:30', // Tells Sequelize/MySQL to use IST instead of UTC
        dialectOptions: {
            useUTC: false, // Prevents automatic UTC conversion
        },
    }
);

module.exports = sequelize;
