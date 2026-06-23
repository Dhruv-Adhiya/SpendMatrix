const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');

// Validation rules
const createCategoryValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters')
    .trim(),
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense')
];

const updateCategoryValidation = [
  param('id').isInt().withMessage('Invalid category ID'),
  body('name')
    .optional()
    .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters')
    .trim(),
  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be either income or expense')
];

const deleteCategoryValidation = [
  param('id').isInt().withMessage('Invalid category ID')
];

// Routes
router.post('/', authMiddleware, createCategoryValidation, categoryController.createCategory);
router.get('/', authMiddleware, categoryController.getCategories);
router.put('/:id', authMiddleware, updateCategoryValidation, categoryController.updateCategory);
router.delete('/:id', authMiddleware, deleteCategoryValidation, categoryController.deleteCategory);

module.exports = router;
