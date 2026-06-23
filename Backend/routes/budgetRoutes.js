const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const budgetController = require('../controllers/budgetController');

// Validation middleware
const createBudgetValidation = [
  body('category_id')
    .notEmpty().withMessage('Category ID is required')
    .isInt({ min: 1 }).withMessage('Category ID must be a positive integer'),
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid integer')
];

const queryMonthYearValidation = [
  query('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  query('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1900, max: 2100 }).withMessage('Year must be a valid integer')
];

const deleteBudgetValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Budget ID must be a positive integer')
];

// Routes
router.post('/', authMiddleware, createBudgetValidation, budgetController.createOrUpdateBudget);
router.get('/', authMiddleware, queryMonthYearValidation, budgetController.getBudgets);
router.get('/summary', authMiddleware, queryMonthYearValidation, budgetController.getBudgetSummary);
router.delete('/:id', authMiddleware, deleteBudgetValidation, budgetController.deleteBudget);

module.exports = router;
