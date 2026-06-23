const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { notifyBudgetAlert } = require('../services/notificationService');

// CREATE OR UPDATE BUDGET (UPSERT)
exports.createOrUpdateBudget = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const { category_id, amount, month, year } = req.body;
    const user_id = req.user.id;

    // Step 1: Verify category ownership
    const categoryResult = await pool.query(
      'SELECT id, type FROM categories WHERE id = $1 AND user_id = $2',
      [category_id, user_id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    // Step 2: Ensure category type is expense
    if (categoryResult.rows[0].type !== 'expense') {
      return res.status(400).json({
        success: false,
        message: 'Budgets can only be created for expense categories',
        data: null
      });
    }

    // Step 3: UPSERT budget
    const budgetResult = await pool.query(
      `INSERT INTO budgets (user_id, category_id, amount, month, year)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, category_id, month, year)
       DO UPDATE SET amount = EXCLUDED.amount
       RETURNING *`,
      [user_id, category_id, amount, month, year]
    );

    const budget = budgetResult.rows[0];

    // Check current spending and fire budget alert if needed
    const spendResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS spent
       FROM transactions
       WHERE user_id = $1 AND category_id = $2 AND type = 'expense'
         AND EXTRACT(MONTH FROM transaction_date) = $3
         AND EXTRACT(YEAR FROM transaction_date) = $4`,
      [user_id, category_id, month, year]
    );
    const spent = parseFloat(spendResult.rows[0].spent);
    notifyBudgetAlert(user_id, {
      category_id,
      category_name: categoryResult.rows[0].name,
      budget: parseFloat(budget.amount),
      spent,
      month,
      year,
    });

    res.status(200).json({
      success: true,
      message: 'Budget created/updated successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

// GET BUDGETS WITH SPENDING
exports.getBudgets = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const { month, year } = req.query;
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT
        b.id AS budget_id,
        b.category_id,
        b.month,
        b.year,
        c.name AS category_name,
        b.amount AS budget_amount,
        COALESCE(SUM(t.amount), 0) AS spent_amount
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
      WHERE b.user_id = $1
        AND b.month = $2
        AND b.year = $3
      GROUP BY b.id, b.month, b.year, c.name
      ORDER BY c.name`,
      [user_id, month, year]
    );

    // Calculate remaining and percentage
    const budgets = result.rows.map(row => {
      const budget = parseFloat(row.budget_amount);
      const spent = parseFloat(row.spent_amount);
      const remaining = budget - spent;
      const percentage_used = budget > 0 ? Math.round((spent / budget) * 100) : 0;

      return {
        id: row.budget_id,
        category_id: row.category_id,
        category_name: row.category_name,
        month: parseInt(row.month),
        year: parseInt(row.year),
        budget,
        spent,
        remaining,
        percentage_used
      };
    });

    res.status(200).json({
      success: true,
      message: 'Budgets retrieved successfully',
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

// DELETE BUDGET
exports.deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// BUDGET SUMMARY
exports.getBudgetSummary = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const { month, year } = req.query;
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT
        COALESCE((SELECT SUM(amount) FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3), 0) AS total_budget,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE user_id = $1 AND type = 'expense'
          AND EXTRACT(MONTH FROM transaction_date) = $2 AND EXTRACT(YEAR FROM transaction_date) = $3
          AND category_id IN (SELECT category_id FROM budgets WHERE user_id = $1 AND month = $2 AND year = $3)), 0) AS total_spent`,
      [user_id, month, year]
    );

    const total_budget = parseFloat(result.rows[0].total_budget) || 0;
    const total_spent = parseFloat(result.rows[0].total_spent) || 0;
    const remaining = total_budget - total_spent;

    res.status(200).json({
      success: true,
      message: 'Budget summary retrieved successfully',
      data: {
        total_budget,
        total_spent,
        remaining
      }
    });
  } catch (error) {
    next(error);
  }
};
