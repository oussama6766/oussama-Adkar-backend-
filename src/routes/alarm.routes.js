const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { Alarm, Nasheed } = require('../models');

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// GET /api/alarms - Get all alarms for user
router.get('/', auth, async (req, res, next) => {
    try {
        const alarms = await Alarm.findAll({
            where: { userId: req.user.id },
            include: [{ model: Nasheed, as: 'nasheed' }],
            order: [['time', 'ASC']]
        });

        res.json({
            success: true,
            data: alarms
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/alarms/:id - Get single alarm
router.get('/:id', auth, [
    param('id').isUUID().withMessage('Invalid alarm ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const alarm = await Alarm.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Nasheed, as: 'nasheed' }]
        });

        if (!alarm) {
            return res.status(404).json({
                success: false,
                message: 'Alarm not found'
            });
        }

        res.json({
            success: true,
            data: alarm
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/alarms - Create alarm
router.post('/', auth, [
    body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid time format (HH:MM or HH:MM:SS)'),
    body('label').optional().isLength({ max: 100 }),
    body('repeatDays').optional().isArray(),
    body('nasheedId').optional().isUUID(),
    body('volume').optional().isInt({ min: 0, max: 100 }),
    body('gradualVolume').optional().isBoolean(),
    body('vibrate').optional().isBoolean(),
    body('snoozeMinutes').optional().isInt({ min: 1, max: 60 }),
    handleValidation
], async (req, res, next) => {
    try {
        const alarmData = {
            ...req.body,
            userId: req.user.id
        };

        const alarm = await Alarm.create(alarmData);

        const alarmWithNasheed = await Alarm.findByPk(alarm.id, {
            include: [{ model: Nasheed, as: 'nasheed' }]
        });

        res.status(201).json({
            success: true,
            message: 'Alarm created successfully',
            data: alarmWithNasheed
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/alarms/:id - Update alarm
router.put('/:id', auth, [
    param('id').isUUID().withMessage('Invalid alarm ID'),
    body('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('label').optional().isLength({ max: 100 }),
    body('repeatDays').optional().isArray(),
    body('nasheedId').optional().isUUID(),
    body('volume').optional().isInt({ min: 0, max: 100 }),
    body('gradualVolume').optional().isBoolean(),
    body('vibrate').optional().isBoolean(),
    body('snoozeMinutes').optional().isInt({ min: 1, max: 60 }),
    body('isActive').optional().isBoolean(),
    handleValidation
], async (req, res, next) => {
    try {
        const alarm = await Alarm.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!alarm) {
            return res.status(404).json({
                success: false,
                message: 'Alarm not found'
            });
        }

        await alarm.update(req.body);

        const updatedAlarm = await Alarm.findByPk(alarm.id, {
            include: [{ model: Nasheed, as: 'nasheed' }]
        });

        res.json({
            success: true,
            message: 'Alarm updated successfully',
            data: updatedAlarm
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/alarms/:id - Delete alarm
router.delete('/:id', auth, [
    param('id').isUUID().withMessage('Invalid alarm ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const alarm = await Alarm.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!alarm) {
            return res.status(404).json({
                success: false,
                message: 'Alarm not found'
            });
        }

        await alarm.destroy();

        res.json({
            success: true,
            message: 'Alarm deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/alarms/:id/toggle - Toggle alarm active state
router.patch('/:id/toggle', auth, [
    param('id').isUUID().withMessage('Invalid alarm ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const alarm = await Alarm.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!alarm) {
            return res.status(404).json({
                success: false,
                message: 'Alarm not found'
            });
        }

        await alarm.update({ isActive: !alarm.isActive });

        res.json({
            success: true,
            message: `Alarm ${alarm.isActive ? 'activated' : 'deactivated'}`,
            data: { isActive: alarm.isActive }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
