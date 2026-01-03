const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alarm = sequelize.define('Alarm', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: 'منبه'
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    repeatDays: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // 0-6 (Sunday-Saturday)
        defaultValue: []
    },
    nasheedId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'nasheeds',
            key: 'id'
        }
    },
    customAudioPath: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    volume: {
        type: DataTypes.INTEGER,
        defaultValue: 70,
        validate: {
            min: 0,
            max: 100
        }
    },
    gradualVolume: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    vibrate: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    snoozeMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    maxSnoozeCount: {
        type: DataTypes.INTEGER,
        defaultValue: 3
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'alarms'
});

module.exports = Alarm;
