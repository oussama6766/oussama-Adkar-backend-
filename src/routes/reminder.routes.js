const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const { Reminder, Adhkar } = require('../models');

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

// GET /api/reminders - Get all reminders for user
router.get('/', auth, async (req, res, next) => {
    try {
        const reminders = await Reminder.findAll({
            where: { userId: req.user.id },
            include: [{ model: Adhkar, as: 'adhkar' }],
            order: [['time', 'ASC']]
        });

        res.json({
            success: true,
            data: reminders
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/reminders/:id - Get single reminder
router.get('/:id', auth, [
    param('id').isUUID().withMessage('Invalid reminder ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const reminder = await Reminder.findOne({
            where: { id: req.params.id, userId: req.user.id },
            include: [{ model: Adhkar, as: 'adhkar' }]
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Reminder not found'
            });
        }

        res.json({
            success: true,
            data: reminder
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/reminders - Create reminder
router.post('/', auth, [
    body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).withMessage('Invalid time format'),
    body('type').optional().isIn(['morning', 'evening', 'custom']),
    body('adhkarId').optional().isUUID(),
    body('label').optional().isLength({ max: 100 }),
    body('repeatDays').optional().isArray(),
    body('notificationTitle').optional().isLength({ max: 100 }),
    body('notificationBody').optional().isLength({ max: 200 }),
    handleValidation
], async (req, res, next) => {
    try {
        const reminderData = {
            ...req.body,
            userId: req.user.id
        };

        const reminder = await Reminder.create(reminderData);

        const reminderWithAdhkar = await Reminder.findByPk(reminder.id, {
            include: [{ model: Adhkar, as: 'adhkar' }]
        });

        res.status(201).json({
            success: true,
            message: 'Reminder created successfully',
            data: reminderWithAdhkar
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/reminders/:id - Update reminder
router.put('/:id', auth, [
    param('id').isUUID().withMessage('Invalid reminder ID'),
    body('time').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/),
    body('type').optional().isIn(['morning', 'evening', 'custom']),
    body('adhkarId').optional().isUUID(),
    body('label').optional().isLength({ max: 100 }),
    body('repeatDays').optional().isArray(),
    body('isActive').optional().isBoolean(),
    handleValidation
], async (req, res, next) => {
    try {
        const reminder = await Reminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Reminder not found'
            });
        }

        await reminder.update(req.body);

        const updatedReminder = await Reminder.findByPk(reminder.id, {
            include: [{ model: Adhkar, as: 'adhkar' }]
        });

        res.json({
            success: true,
            message: 'Reminder updated successfully',
            data: updatedReminder
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/reminders/:id - Delete reminder
router.delete('/:id', auth, [
    param('id').isUUID().withMessage('Invalid reminder ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const reminder = await Reminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Reminder not found'
            });
        }

        await reminder.destroy();

        res.json({
            success: true,
            message: 'Reminder deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/reminders/:id/toggle - Toggle reminder active state
router.patch('/:id/toggle', auth, [
    param('id').isUUID().withMessage('Invalid reminder ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const reminder = await Reminder.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!reminder) {
            return res.status(404).json({
                success: false,
                message: 'Reminder not found'
            });
        }

        await reminder.update({ isActive: !reminder.isActive });

        res.json({
            success: true,
            message: `Reminder ${reminder.isActive ? 'activated' : 'deactivated'}`,
            data: { isActive: reminder.isActive }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
