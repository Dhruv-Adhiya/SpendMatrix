const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const recurringController = require('../controllers/recurringController');

// Validation rules
const createValidation = [
  body('category_id').isInt({ min: 1 }).withMessage('Valid category_id required'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('description').optional().isString(),
  body('frequency').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
  body('start_date').isDate().withMessage('Valid start_date required'),
  body('end_date').optional({ nullable: true }).isDate().withMessage('Valid end_date required')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) < new Date(req.body.start_date)) {
        throw new Error('end_date must be >= start_date');
      }
      return true;
    }),
  body('payment_source').optional().isIn(['cash', 'online', 'credit_card']).withMessage('payment_source must be cash, online, or credit_card')
];

const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid id required'),
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('description').optional().isString(),
  body('frequency').optional().isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid frequency'),
  body('end_date').optional({ nullable: true }).isDate().withMessage('Valid end_date required'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  body('payment_source').optional().isIn(['cash', 'online', 'credit_card']).withMessage('payment_source must be cash, online, or credit_card')
];

const deleteValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid id required')
];

// Routes
router.post('/', authMiddleware, createValidation, recurringController.createRecurring);
router.get('/', authMiddleware, recurringController.getRecurring);
router.put('/:id', authMiddleware, updateValidation, recurringController.updateRecurring);
router.delete('/:id', authMiddleware, deleteValidation, recurringController.deleteRecurring);

module.exports = router;
