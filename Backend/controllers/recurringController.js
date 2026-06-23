const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Create Recurring Rule
exports.createRecurring = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const { category_id, type, amount, description, frequency, start_date, end_date, payment_source } = req.body;
    const userId = req.user.id;

    // Verify category ownership
    const categoryCheck = await pool.query(
      'SELECT id, type FROM categories WHERE id = $1 AND user_id = $2',
      [category_id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    // Insert recurring rule
    const result = await pool.query(
      `INSERT INTO recurring_transactions 
      (user_id, category_id, type, amount, description, frequency, start_date, end_date, next_run_date, payment_source) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $7, $9) 
      RETURNING *`,
      [userId, category_id, type, amount, description, frequency, start_date, end_date, payment_source ?? 'online']
    );

    res.status(201).json({
      success: true,
      message: 'Recurring rule created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate recurring rule already exists',
        data: null
      });
    }
    next(error);
  }
};

// Get All Recurring Rules
exports.getRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, category_id, type, amount, description, frequency, start_date, end_date, 
      next_run_date, last_run_date, is_active, payment_source 
      FROM recurring_transactions 
      WHERE user_id = $1 
      ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Recurring rules retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Update Recurring Rule
exports.updateRecurring = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const recurringId = req.params.id;
    const userId = req.user.id;
    const { amount, description, frequency, end_date, is_active, payment_source } = req.body;

    // Ownership check
    const recurringCheck = await pool.query(
      'SELECT * FROM recurring_transactions WHERE id = $1 AND user_id = $2',
      [recurringId, userId]
    );

    if (recurringCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurring rule not found',
        data: null
      });
    }

    // Build dynamic update
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (amount !== undefined) {
      updates.push(`amount = $${paramCount++}`);
      values.push(amount);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (frequency !== undefined) {
      updates.push(`frequency = $${paramCount++}`);
      values.push(frequency);
    }

    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (payment_source !== undefined) {
      updates.push(`payment_source = $${paramCount++}`);
      values.push(payment_source);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        data: null
      });
    }

    values.push(recurringId, userId);

    const result = await pool.query(
      `UPDATE recurring_transactions SET ${updates.join(', ')} 
      WHERE id = $${paramCount++} AND user_id = $${paramCount++} 
      RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Recurring rule updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete Recurring Rule
exports.deleteRecurring = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const recurringId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [recurringId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recurring rule not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recurring rule deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
