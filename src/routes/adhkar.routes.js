const express = require('express');
const { param, query, validationResult } = require('express-validator');
const { optionalAuth } = require('../middleware/auth');
const { Adhkar } = require('../models');

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

// GET /api/adhkar - Get all adhkar
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { category, limit, offset } = req.query;

        const where = {};
        if (category) {
            where.category = category;
        }

        const adhkar = await Adhkar.findAndCountAll({
            where,
            order: [['category', 'ASC'], ['orderNum', 'ASC']],
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        });

        res.json({
            success: true,
            data: adhkar.rows,
            pagination: {
                total: adhkar.count,
                limit: limit ? parseInt(limit) : adhkar.count,
                offset: offset ? parseInt(offset) : 0
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/adhkar/categories - Get all categories
router.get('/categories', async (req, res, next) => {
    try {
        const categories = [
            { id: 'morning', nameAr: 'أذكار الصباح', nameEn: 'Morning Adhkar', icon: 'sunrise' },
            { id: 'evening', nameAr: 'أذكار المساء', nameEn: 'Evening Adhkar', icon: 'sunset' },
            { id: 'sleep', nameAr: 'أذكار النوم', nameEn: 'Sleep Adhkar', icon: 'moon' },
            { id: 'wake', nameAr: 'أذكار الاستيقاظ', nameEn: 'Wake Up Adhkar', icon: 'sun' },
            { id: 'prayer', nameAr: 'أذكار الصلاة', nameEn: 'Prayer Adhkar', icon: 'mosque' },
            { id: 'general', nameAr: 'أذكار عامة', nameEn: 'General Adhkar', icon: 'book' },
            { id: 'food', nameAr: 'أذكار الطعام', nameEn: 'Food Adhkar', icon: 'food' },
            { id: 'travel', nameAr: 'أذكار السفر', nameEn: 'Travel Adhkar', icon: 'travel' }
        ];

        // Get count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const count = await Adhkar.count({ where: { category: cat.id } });
                return { ...cat, count };
            })
        );

        res.json({
            success: true,
            data: categoriesWithCount
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/adhkar/:category - Get adhkar by category
router.get('/:category', optionalAuth, [
    param('category').isIn(['morning', 'evening', 'sleep', 'wake', 'prayer', 'general', 'food', 'travel'])
        .withMessage('Invalid category'),
    handleValidation
], async (req, res, next) => {
    try {
        const adhkar = await Adhkar.findAll({
            where: { category: req.params.category },
            order: [['orderNum', 'ASC']]
        });

        res.json({
            success: true,
            data: adhkar
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/adhkar/id/:id - Get single dhikr
router.get('/id/:id', [
    param('id').isUUID().withMessage('Invalid adhkar ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const dhikr = await Adhkar.findByPk(req.params.id);

        if (!dhikr) {
            return res.status(404).json({
                success: false,
                message: 'Dhikr not found'
            });
        }

        res.json({
            success: true,
            data: dhikr
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
