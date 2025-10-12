const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const SocialAccount = sequelize.define('SocialAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    platform: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    account_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    account_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    access_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    refresh_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    tableName: 'social_accounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

SocialAccount.associate = (models) => {
    SocialAccount.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
};

module.exports = SocialAccount;
