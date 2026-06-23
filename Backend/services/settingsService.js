const pool = require('../config/db');

const VALID_DATE_FORMATS = ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'];

const createDefaultSettings = async (userId) => {
  const result = await pool.query(
    `INSERT INTO user_settings (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING *`,
    [userId]
  );
  // If ON CONFLICT fired, fetch the existing row
  if (result.rows.length === 0) {
    return getSettings(userId);
  }
  return result.rows[0];
};

const getSettings = async (userId) => {
  const result = await pool.query(
    `SELECT currency, timezone, date_format, notification_enabled, budget_alert_threshold
     FROM user_settings WHERE user_id = $1`,
    [userId]
  );
  if (result.rows.length === 0) {
    return createDefaultSettings(userId).then(() => getSettings(userId));
  }
  return result.rows[0];
};

const updateSettings = async (userId, fields) => {
  const allowed = ['currency', 'timezone', 'date_format', 'notification_enabled', 'budget_alert_threshold'];
  const updates = Object.keys(fields).filter((k) => allowed.includes(k));

  if (updates.length === 0) throw Object.assign(new Error('No valid fields provided'), { status: 400 });

  // Validate individual fields
  if (fields.currency !== undefined && (typeof fields.currency !== 'string' || fields.currency.trim().length === 0 || fields.currency.length > 10)) {
    throw Object.assign(new Error('Invalid currency: must be a non-empty string up to 10 characters'), { status: 400 });
  }
  if (fields.timezone !== undefined && (typeof fields.timezone !== 'string' || fields.timezone.trim().length === 0)) {
    throw Object.assign(new Error('Invalid timezone: must be a non-empty string'), { status: 400 });
  }
  if (fields.date_format !== undefined && !VALID_DATE_FORMATS.includes(fields.date_format)) {
    throw Object.assign(new Error(`Invalid date_format. Allowed: ${VALID_DATE_FORMATS.join(', ')}`), { status: 400 });
  }
  if (fields.budget_alert_threshold !== undefined) {
    const t = Number(fields.budget_alert_threshold);
    if (!Number.isInteger(t) || t < 0 || t > 100) {
      throw Object.assign(new Error('budget_alert_threshold must be an integer between 0 and 100'), { status: 400 });
    }
  }
  if (fields.notification_enabled !== undefined && typeof fields.notification_enabled !== 'boolean') {
    throw Object.assign(new Error('notification_enabled must be a boolean'), { status: 400 });
  }

  const setClauses = updates.map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = updates.map((key) => fields[key]);

  const result = await pool.query(
    `UPDATE user_settings SET ${setClauses}
     WHERE user_id = $1
     RETURNING currency, timezone, date_format, notification_enabled, budget_alert_threshold`,
    [userId, ...values]
  );

  if (result.rows.length === 0) {
    // Settings row didn't exist — create defaults then retry
    await createDefaultSettings(userId);
    return updateSettings(userId, fields);
  }

  return result.rows[0];
};

module.exports = { getSettings, updateSettings, createDefaultSettings };
