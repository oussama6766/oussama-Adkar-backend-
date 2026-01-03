const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Adhkar = sequelize.define('Adhkar', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    category: {
        type: DataTypes.ENUM('morning', 'evening', 'sleep', 'wake', 'prayer', 'general', 'food', 'travel'),
        allowNull: false
    },
    textAr: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    textEn: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reference: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    defaultCount: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    audioUrl: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    orderNum: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    reward: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'adhkar'
});

module.exports = Adhkar;
