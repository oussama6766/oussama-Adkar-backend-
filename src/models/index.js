const User = require('./User');
const Alarm = require('./Alarm');
const Nasheed = require('./Nasheed');
const Adhkar = require('./Adhkar');
const Reminder = require('./Reminder');

// User -> Alarms (One to Many)
User.hasMany(Alarm, { foreignKey: 'userId', as: 'alarms' });
Alarm.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Nasheed -> Alarms (One to Many)
Nasheed.hasMany(Alarm, { foreignKey: 'nasheedId', as: 'alarms' });
Alarm.belongsTo(Nasheed, { foreignKey: 'nasheedId', as: 'nasheed' });

// User -> Reminders (One to Many)
User.hasMany(Reminder, { foreignKey: 'userId', as: 'reminders' });
Reminder.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Adhkar -> Reminders (One to Many)
Adhkar.hasMany(Reminder, { foreignKey: 'adhkarId', as: 'reminders' });
Reminder.belongsTo(Adhkar, { foreignKey: 'adhkarId', as: 'adhkar' });

// User -> Nasheeds (uploaded by - One to Many)
User.hasMany(Nasheed, { foreignKey: 'uploadedBy', as: 'uploadedNasheeds' });
Nasheed.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

module.exports = {
    User,
    Alarm,
    Nasheed,
    Adhkar,
    Reminder
};
