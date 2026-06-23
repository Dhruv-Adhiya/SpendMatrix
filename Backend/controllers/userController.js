const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { validationResult } = require('express-validator');
const { sendPasswordChangedEmail } = require('../services/emailService');

const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

const getProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 400;
      return next(error);
    }

    const { full_name, email } = req.body;

    if (!full_name && !email) {
      const error = new Error('At least one field is required');
      error.statusCode = 400;
      return next(error);
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (full_name) {
      fields.push(`full_name = $${paramCount++}`);
      values.push(full_name);
    }

    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );

      if (emailCheck.rows.length > 0) {
        const error = new Error('Email already in use');
        error.statusCode = 409;
        return next(error);
      }

      fields.push(`email = $${paramCount++}`);
      values.push(email);
    }

    values.push(req.user.id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, full_name, email, created_at`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 400;
      return next(error);
    }

    const { oldPassword, newPassword } = req.body;

    const user = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);

    if (user.rows.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const validPassword = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!validPassword) {
      const error = new Error('Old password is incorrect');
      error.statusCode = 401;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    // Fetch email for notification
    const userEmail = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
    try {
      await sendPasswordChangedEmail(userEmail.rows[0].email, {
        ip: getIp(req),
        time: new Date().toUTCString(),
      });
    } catch (err) {
      console.error('Password change email failed:', err.message);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
