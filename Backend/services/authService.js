const crypto = require('crypto');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { sendPasswordResetEmail, sendVerificationEmail } = require('./emailService');

const forgotPassword = async (email) => {
  const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  // Always return success — never reveal if email exists
  if (userResult.rows.length === 0) return;

  const userId = userResult.rows[0].id;
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Invalidate any existing active token for this user
  await pool.query(
    'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
    [userId]
  );

  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  await sendPasswordResetEmail(email, token);
};

const resetPassword = async (token, newPassword) => {
  const result = await pool.query(
    'SELECT * FROM password_reset_tokens WHERE token = $1',
    [token]
  );

  if (result.rows.length === 0) {
    throw new Error('INVALID_TOKEN');
  }

  const record = result.rows[0];

  if (record.used) {
    throw new Error('TOKEN_USED');
  }

  if (new Date() > new Date(record.expires_at)) {
    throw new Error('TOKEN_EXPIRED');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, record.user_id]);
  await pool.query('UPDATE password_reset_tokens SET used = true WHERE token = $1', [token]);
  return record.user_id;
};

const createVerificationToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Remove any existing unverified token for this user
  await pool.query('DELETE FROM email_verification_tokens WHERE user_id = $1', [userId]);

  await pool.query(
    'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
};

const verifyEmailToken = async (token) => {
  if (!token) throw new Error('INVALID_TOKEN');

  const result = await pool.query(
    'SELECT * FROM email_verification_tokens WHERE token = $1',
    [token]
  );

  if (result.rows.length === 0) throw new Error('ALREADY_VERIFIED');

  const record = result.rows[0];

  if (new Date() > new Date(record.expires_at)) {
    await pool.query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
    throw new Error('TOKEN_EXPIRED');
  }

  const userResult = await pool.query('SELECT is_verified FROM users WHERE id = $1', [record.user_id]);
  if (userResult.rows[0]?.is_verified) throw new Error('ALREADY_VERIFIED');

  await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [record.user_id]);
  await pool.query('DELETE FROM email_verification_tokens WHERE token = $1', [token]);
};

module.exports = { forgotPassword, resetPassword, createVerificationToken, verifyEmailToken };
