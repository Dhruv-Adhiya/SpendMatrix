const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const analyticsController = require('../controllers/analyticsController');

router.get('/monthly-summary', authMiddleware, analyticsController.getMonthlySummary);
router.get('/category-breakdown', authMiddleware, analyticsController.getCategoryBreakdown);
router.get('/budget-vs-actual', authMiddleware, analyticsController.getBudgetVsActual);
router.get('/daily-expense', authMiddleware, analyticsController.getDailyExpense);
router.get('/payment-source-breakdown', authMiddleware, analyticsController.getPaymentSourceBreakdown);

module.exports = router;
