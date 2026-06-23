const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// Validation rules
const createValidation = [
  body('category_id')
    .isInt({ min: 1 }).withMessage('Valid category_id is required'),
  body('type')
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description too long'),
  body('transaction_date')
    .isDate().withMessage('Valid transaction_date is required'),
  body('payment_source')
    .optional()
    .isIn(['cash', 'online', 'credit_card']).withMessage('payment_source must be cash, online, or credit_card')
];

const updateValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid transaction ID is required'),
  body('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Valid category_id is required'),
  body('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description too long'),
  body('transaction_date')
    .optional()
    .isDate().withMessage('Valid transaction_date is required'),
  body('payment_source')
    .optional()
    .isIn(['cash', 'online', 'credit_card']).withMessage('payment_source must be cash, online, or credit_card')
];

const deleteValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid transaction ID is required')
];

const getValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('cursor_date')
    .optional()
    .isDate().withMessage('Invalid cursor_date'),
  query('cursor_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid cursor_id'),
  query('type')
    .optional()
    .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('category_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid category_id'),
  query('start_date')
    .optional()
    .isDate().withMessage('Invalid start_date'),
  query('end_date')
    .optional()
    .isDate().withMessage('Invalid end_date'),
  query('sort')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort must be asc or desc')
];

const searchValidation = [
  query('search').optional().trim().isLength({ max: 200 }).withMessage('Search too long'),
  query('category_id').optional().isInt({ min: 1 }).withMessage('Invalid category_id'),
  query('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  query('startDate').optional().isDate().withMessage('Invalid startDate'),
  query('endDate').optional().isDate().withMessage('Invalid endDate'),
  query('minAmount').optional().isFloat({ min: 0.01 }).withMessage('Invalid minAmount'),
  query('maxAmount').optional().isFloat({ min: 0.01 }).withMessage('Invalid maxAmount'),
  query('sortBy').optional().isIn(['date', 'amount']).withMessage('sortBy must be date or amount'),
  query('order').optional().isIn(['asc', 'desc']).withMessage('order must be asc or desc'),
  query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
];

// Routes
router.post('/', authMiddleware, createValidation, transactionController.createTransaction);
router.get('/search', authMiddleware, searchValidation, transactionController.searchTransactions);
router.get('/', authMiddleware, getValidation, transactionController.getTransactions);
router.put('/:id', authMiddleware, updateValidation, transactionController.updateTransaction);
router.delete('/:id', authMiddleware, deleteValidation, transactionController.deleteTransaction);

module.exports = router;
