const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reminder = sequelize.define('Reminder', {
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
    adhkarId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'adhkar',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('morning', 'evening', 'custom'),
        defaultValue: 'custom'
    },
    label: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    repeatDays: {
        type: DataTypes.ARRAY(DataTypes.INTEGER), // 0-6 (Sunday-Saturday)
        defaultValue: [0, 1, 2, 3, 4, 5, 6] // Daily by default
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notificationTitle: {
        type: DataTypes.STRING(100),
        defaultValue: 'تذكير الأذكار'
    },
    notificationBody: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    lastTriggeredAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'reminders'
});

module.exports = Reminder;
