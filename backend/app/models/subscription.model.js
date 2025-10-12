const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Subscription = sequelize.define('Subscription', {
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
    plan_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'plans',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'active',
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    posts_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    ai_posts_used: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    auto_renew: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    }
}, {
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Subscription.associate = (models) => {
    Subscription.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    Subscription.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'Plan' });
};

module.exports = Subscription;
