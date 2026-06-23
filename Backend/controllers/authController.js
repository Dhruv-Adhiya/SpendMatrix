const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { createDefaultSettings } = require('../services/settingsService');
const { forgotPassword, resetPassword, createVerificationToken, verifyEmailToken } = require('../services/authService');
const { sendWelcomeEmail, sendVerificationEmail } = require('../services/emailService');
const { checkAndHandleDevice } = require('../services/deviceService');
const { insertAuditLog } = require('../services/adminService');

const createUser = async (full_name, email, password, role) => {
  if (!full_name || !email || !password) throw new Error('All fields are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (userExists.rows.length > 0) throw new Error('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await pool.query(
    'INSERT INTO users (full_name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, created_at',
    [full_name, email, hashedPassword, role]
  );

  await createDefaultSettings(newUser.rows[0].id);

  try {
    const verificationToken = await createVerificationToken(newUser.rows[0].id);
    await sendVerificationEmail(email, verificationToken);
  } catch (err) {
    console.error('Verification email failed:', err.message);
  }

  try {
    await sendWelcomeEmail(email, full_name);
  } catch (err) {
    console.error('Welcome email failed:', err.message);
  }

  return newUser.rows[0];
};

const register = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    const user = await createUser(full_name, email, password, 'user');
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    insertAuditLog({ user_id: user.id, action: 'REGISTER', ip_address: ip });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    const clientErrors = ['All fields are required', 'Password must be at least 6 characters', 'User already exists'];
    if (clientErrors.includes(error.message)) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
};

const registerAdmin = async (req, res) => {
  try {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== process.env.ADMIN_REGISTRATION_SECRET)
      return res.status(403).json({ error: 'Invalid admin secret' });

    const { full_name, email, password } = req.body;
    const user = await createUser(full_name, email, password, 'admin');
    res.status(201).json({ message: 'Admin registered successfully', user });
  } catch (error) {
    const clientErrors = ['All fields are required', 'Password must be at least 6 characters', 'User already exists'];
    if (clientErrors.includes(error.message)) return res.status(400).json({ error: error.message });
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.rows[0].is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    if (user.rows[0].is_blocked) {
      return res.status(403).json({ error: 'Your account has been blocked. Contact support.' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user.rows[0];

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Fire-and-forget — must not block login
    checkAndHandleDevice(user.rows[0].id, user.rows[0].email, userAgent, ip).catch(
      (err) => console.error('Device check failed:', err.message)
    );

    insertAuditLog({ user_id: user.rows[0].id, action: 'LOGIN', ip_address: ip });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    await forgotPassword(email);
    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const userId = await resetPassword(token, newPassword);
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    insertAuditLog({ user_id: userId, action: 'PASSWORD_RESET', ip_address: ip });
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    if (error.message === 'INVALID_TOKEN' || error.message === 'TOKEN_USED') {
      return res.status(400).json({ error: 'Invalid or already used reset token' });
    }
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(400).json({ error: 'Reset token has expired' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

const verifyEmailHandler = async (req, res) => {
  try {
    const { token } = req.query;
    await verifyEmailToken(token);
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    if (error.message === 'INVALID_TOKEN') return res.status(400).json({ error: 'Invalid verification token.' });
    if (error.message === 'TOKEN_EXPIRED') return res.status(400).json({ error: 'Verification token has expired. Please register again.' });
    if (error.message === 'ALREADY_VERIFIED') return res.status(400).json({ error: 'Email is already verified.' });
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { register, registerAdmin, login, forgotPasswordHandler, resetPasswordHandler, verifyEmailHandler };
