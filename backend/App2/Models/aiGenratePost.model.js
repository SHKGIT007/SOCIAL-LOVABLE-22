const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const AiGenratePost = sequelize.define('AiGenratePost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
        // Ensure support for emojis/unicode
        get() {
            const rawValue = this.getDataValue('content');
            return rawValue;
        }
    },
    status: {
        type: DataTypes.ENUM('0', '1'),
        allowNull: false,
        defaultValue: '0',
    },
    is_ai_generated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    ai_prompt: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    scheduled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    published_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    media_urls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    analytics: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    image_prompt: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    video_url: {
        type: DataTypes.TEXT,
        allowNull: true,
    }

}, {
    tableName: 'aiGenratePosts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
});

AiGenratePost.associate = (models) => {
    AiGenratePost.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
};

module.exports = AiGenratePost;
