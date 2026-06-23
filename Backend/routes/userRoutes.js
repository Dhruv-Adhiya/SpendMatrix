const express = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getProfile);

router.put('/me', authMiddleware, [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty')
], updateProfile);

router.put('/change-password', authMiddleware, [
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], changePassword);

module.exports = router;
