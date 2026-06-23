const pool = require('../config/db');
const { validationResult } = require('express-validator');

// Create Category
exports.createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const { name, type } = req.body;
    const userId = req.user.id;

    // Check duplicate
    const duplicateCheck = await pool.query(
      'SELECT id FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND type = $3',
      [userId, name, type]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
        data: null
      });
    }

    // Insert category
    const result = await pool.query(
      'INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, type]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Get All Categories
exports.getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;

    let query = 'SELECT * FROM categories WHERE user_id = $1';
    const params = [userId];

    if (type) {
      query += ' AND type = $2';
      params.push(type);
    }

    query += ' ORDER BY type ASC, name ASC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

// Update Category
exports.updateCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const categoryId = req.params.id;
    const userId = req.user.id;
    const { name, type } = req.body;

    // Ownership check
    const categoryCheck = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [categoryId, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    const existingCategory = categoryCheck.rows[0];

    // Check if type is changing and transactions exist
    if (type && type !== existingCategory.type) {
      const transactionCheck = await pool.query(
        'SELECT COUNT(*) FROM transactions WHERE category_id = $1',
        [categoryId]
      );

      if (parseInt(transactionCheck.rows[0].count) > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change category type because transactions exist',
          data: null
        });
      }
    }

    // Check duplicate if name or type changed
    const newName = name || existingCategory.name;
    const newType = type || existingCategory.type;

    if (name || type) {
      const duplicateCheck = await pool.query(
        'SELECT id FROM categories WHERE user_id = $1 AND LOWER(name) = LOWER($2) AND type = $3 AND id != $4',
        [userId, newName, newType, categoryId]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists',
          data: null
        });
      }
    }

    // Build dynamic update
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (type) {
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }

    values.push(categoryId, userId);

    const result = await pool.query(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = $${paramCount++} AND user_id = $${paramCount++} RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete Category
exports.deleteCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: errors.array()
      });
    }

    const categoryId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
      [categoryId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: null
    });
  } catch (error) {
    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing transactions',
        data: null
      });
    }
    next(error);
  }
};
