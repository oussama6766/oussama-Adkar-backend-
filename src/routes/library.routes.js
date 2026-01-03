const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, param, validationResult } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const { Nasheed } = require('../models');

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/nasheeds'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
    }
});

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

// GET /api/library - Get all nasheeds
router.get('/', optionalAuth, async (req, res, next) => {
    try {
        const { category, search, limit, offset } = req.query;

        const where = { isApproved: true };

        if (category) {
            where.category = category;
        }

        const nasheeds = await Nasheed.findAndCountAll({
            where,
            order: [['isDefault', 'DESC'], ['title', 'ASC']],
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        });

        res.json({
            success: true,
            data: nasheeds.rows,
            pagination: {
                total: nasheeds.count,
                limit: limit ? parseInt(limit) : nasheeds.count,
                offset: offset ? parseInt(offset) : 0
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/library/default - Get default nasheeds only
router.get('/default', async (req, res, next) => {
    try {
        const nasheeds = await Nasheed.findAll({
            where: { isDefault: true, isApproved: true },
            order: [['category', 'ASC'], ['title', 'ASC']]
        });

        res.json({
            success: true,
            data: nasheeds
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/library/:id - Get single nasheed
router.get('/:id', [
    param('id').isUUID().withMessage('Invalid nasheed ID'),
    handleValidation
], async (req, res, next) => {
    try {
        const nasheed = await Nasheed.findByPk(req.params.id);

        if (!nasheed) {
            return res.status(404).json({
                success: false,
                message: 'Nasheed not found'
            });
        }

        // Increment play count
        await nasheed.increment('playCount');

        res.json({
            success: true,
            data: nasheed
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/library/upload - Upload new nasheed (requires auth)
router.post('/upload', auth, upload.single('audio'), [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').optional().isIn(['morning', 'evening', 'general', 'children', 'quran']),
    handleValidation
], async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Audio file is required'
            });
        }

        const nasheedData = {
            title: req.body.title,
            titleEn: req.body.titleEn,
            artist: req.body.artist,
            duration: req.body.duration,
            category: req.body.category || 'general',
            fileUrl: `/uploads/nasheeds/${req.file.filename}`,
            uploadedBy: req.user.id,
            isDefault: false,
            isApproved: false // Requires admin approval
        };

        const nasheed = await Nasheed.create(nasheedData);

        res.status(201).json({
            success: true,
            message: 'Nasheed uploaded successfully. Pending approval.',
            data: nasheed
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/library/user/uploads - Get user's uploaded nasheeds
router.get('/user/uploads', auth, async (req, res, next) => {
    try {
        const nasheeds = await Nasheed.findAll({
            where: { uploadedBy: req.user.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: nasheeds
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
