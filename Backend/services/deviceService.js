const crypto = require('crypto');
const pool = require('../config/db');
const { sendLoginAlertEmail } = require('./emailService');

const generateDeviceHash = (userAgent, ip) => {
  const raw = `${userAgent || 'unknown'}|${ip || 'unknown'}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

// Returns true if new device (alert sent), false if known device
const checkAndHandleDevice = async (userId, email, userAgent, ip) => {
  const deviceHash = generateDeviceHash(userAgent, ip);
  const ua = (userAgent || 'Unknown').substring(0, 1000);

  const existing = await pool.query(
    'SELECT id FROM user_devices WHERE user_id = $1 AND device_hash = $2',
    [userId, deviceHash]
  );

  if (existing.rows.length > 0) {
    // Known device — update last_used_at
    await pool.query(
      'UPDATE user_devices SET last_used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND device_hash = $2',
      [userId, deviceHash]
    );
    return false;
  }

  // New device — insert and send alert
  await pool.query(
    'INSERT INTO user_devices (user_id, device_hash, user_agent, ip_address) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, device_hash) DO UPDATE SET last_used_at = CURRENT_TIMESTAMP',
    [userId, deviceHash, ua, ip || null]
  );

  try {
    await sendLoginAlertEmail(email, {
      ip: ip || 'Unknown',
      userAgent: ua,
      time: new Date().toUTCString(),
    });
  } catch (err) {
    console.error('Login alert email failed:', err.message);
  }

  return true;
};

module.exports = { generateDeviceHash, checkAndHandleDevice };
