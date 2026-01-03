const express = require('express');
const { auth } = require('../middleware/auth');
const { User, Alarm, Reminder, Nasheed, Adhkar } = require('../models');

const router = express.Router();

// POST /api/sync - Sync all user data
router.post('/', auth, async (req, res, next) => {
    try {
        const { alarms, reminders, lastSyncAt } = req.body;
        const userId = req.user.id;
        const syncResults = {
            alarms: { created: 0, updated: 0, deleted: 0 },
            reminders: { created: 0, updated: 0, deleted: 0 }
        };

        // Sync alarms from client
        if (alarms && Array.isArray(alarms)) {
            for (const alarm of alarms) {
                if (alarm._deleted) {
                    const deleted = await Alarm.destroy({
                        where: { id: alarm.id, userId }
                    });
                    syncResults.alarms.deleted += deleted;
                } else if (alarm.id) {
                    const existing = await Alarm.findOne({
                        where: { id: alarm.id, userId }
                    });
                    if (existing) {
                        await existing.update(alarm);
                        syncResults.alarms.updated++;
                    } else {
                        await Alarm.create({ ...alarm, userId });
                        syncResults.alarms.created++;
                    }
                } else {
                    await Alarm.create({ ...alarm, userId });
                    syncResults.alarms.created++;
                }
            }
        }

        // Sync reminders from client
        if (reminders && Array.isArray(reminders)) {
            for (const reminder of reminders) {
                if (reminder._deleted) {
                    const deleted = await Reminder.destroy({
                        where: { id: reminder.id, userId }
                    });
                    syncResults.reminders.deleted += deleted;
                } else if (reminder.id) {
                    const existing = await Reminder.findOne({
                        where: { id: reminder.id, userId }
                    });
                    if (existing) {
                        await existing.update(reminder);
                        syncResults.reminders.updated++;
                    } else {
                        await Reminder.create({ ...reminder, userId });
                        syncResults.reminders.created++;
                    }
                } else {
                    await Reminder.create({ ...reminder, userId });
                    syncResults.reminders.created++;
                }
            }
        }

        // Update user's last sync time
        await req.user.update({ lastSyncAt: new Date() });

        // Fetch server data to return
        const serverAlarms = await Alarm.findAll({
            where: { userId },
            include: [{ model: Nasheed, as: 'nasheed' }]
        });

        const serverReminders = await Reminder.findAll({
            where: { userId },
            include: [{ model: Adhkar, as: 'adhkar' }]
        });

        res.json({
            success: true,
            message: 'Sync completed',
            data: {
                alarms: serverAlarms,
                reminders: serverReminders,
                syncResults,
                lastSyncAt: req.user.lastSyncAt
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sync/backup - Get full backup of user data
router.get('/backup', auth, async (req, res, next) => {
    try {
        const userId = req.user.id;

        const alarms = await Alarm.findAll({
            where: { userId },
            include: [{ model: Nasheed, as: 'nasheed' }]
        });

        const reminders = await Reminder.findAll({
            where: { userId },
            include: [{ model: Adhkar, as: 'adhkar' }]
        });

        const backup = {
            user: req.user.toJSON(),
            alarms,
            reminders,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };

        res.json({
            success: true,
            data: backup
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/sync/restore - Restore from backup
router.post('/restore', auth, async (req, res, next) => {
    try {
        const { alarms, reminders, settings } = req.body;
        const userId = req.user.id;

        // Clear existing data (optional - could be configurable)
        await Alarm.destroy({ where: { userId } });
        await Reminder.destroy({ where: { userId } });

        // Restore alarms
        if (alarms && Array.isArray(alarms)) {
            for (const alarm of alarms) {
                const { id, user, nasheed, ...alarmData } = alarm;
                await Alarm.create({ ...alarmData, userId });
            }
        }

        // Restore reminders
        if (reminders && Array.isArray(reminders)) {
            for (const reminder of reminders) {
                const { id, user, adhkar, ...reminderData } = reminder;
                await Reminder.create({ ...reminderData, userId });
            }
        }

        // Update settings if provided
        if (settings) {
            await req.user.update({ settings });
        }

        res.json({
            success: true,
            message: 'Backup restored successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
