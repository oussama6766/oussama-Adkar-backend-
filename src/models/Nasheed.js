const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Nasheed = sequelize.define('Nasheed', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    titleEn: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    artist: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in seconds
        allowNull: true
    },
    fileUrl: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    thumbnailUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('morning', 'evening', 'general', 'children', 'quran'),
        defaultValue: 'general'
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    uploadedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    playCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'nasheeds'
});

module.exports = Nasheed;
