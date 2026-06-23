const pool = require('../config/db');

const getAllUsers = async ({ search, is_blocked, role, page = 1, limit = 20 }) => {
  const parsedLimit = Math.min(parseInt(limit) || 20, 100);
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }
  if (is_blocked !== undefined && is_blocked !== '') {
    params.push(is_blocked === 'true' || is_blocked === true);
    conditions.push(`is_blocked = $${params.length}`);
  }
  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT id, full_name, email, currency, role, is_blocked, created_at
       FROM users ${where}
       ORDER BY created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    ),
    pool.query(`SELECT COUNT(*) FROM users ${where}`, params),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    data: dataResult.rows,
    pagination: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
  };
};

const getUserById = async (id) => {
  const result = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.currency, u.role, u.is_blocked, u.created_at,
            us.timezone, us.date_format, us.notification_enabled, us.budget_alert_threshold
     FROM users u
     LEFT JOIN user_settings us ON us.user_id = u.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

const blockUser = async (id, is_blocked) => {
  const result = await pool.query(
    `UPDATE users SET is_blocked = $1 WHERE id = $2 AND role != 'admin' RETURNING id, full_name, email, is_blocked`,
    [is_blocked, id]
  );
  return result.rows[0] || null;
};

const deleteUser = async (id, requestingAdminId) => {
  if (parseInt(id) === parseInt(requestingAdminId)) {
    throw new Error('SELF_DELETE');
  }
  const check = await pool.query(`SELECT role FROM users WHERE id = $1`, [id]);
  if (check.rows.length === 0) return false;
  if (check.rows[0].role === 'admin') throw new Error('DELETE_ADMIN');

  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  return true;
};

const getDashboardStats = async () => {
  const [users, transactions] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE NOT is_blocked) AS active FROM users`),
    pool.query(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS total_income,
              COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS total_expense
       FROM transactions`
    ),
  ]);

  return {
    total_users: parseInt(users.rows[0].total),
    active_users: parseInt(users.rows[0].active),
    total_transactions: parseInt(transactions.rows[0].total),
    total_income: parseFloat(transactions.rows[0].total_income),
    total_expense: parseFloat(transactions.rows[0].total_expense),
  };
};

const getAuditLogs = async ({ user_id, action, startDate, endDate, page = 1, limit = 10 }) => {
  const parsedLimit = Math.min(parseInt(limit) || 10, 100);
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  if (user_id && isNaN(parseInt(user_id))) throw Object.assign(new Error('Invalid user_id'), { status: 400 });
  if (startDate && isNaN(Date.parse(startDate))) throw Object.assign(new Error('Invalid startDate'), { status: 400 });
  if (endDate && isNaN(Date.parse(endDate))) throw Object.assign(new Error('Invalid endDate'), { status: 400 });
  if (startDate && endDate && new Date(startDate) > new Date(endDate))
    throw Object.assign(new Error('startDate cannot be after endDate'), { status: 400 });

  const conditions = [];
  const params = [];

  if (user_id) {
    params.push(parseInt(user_id));
    conditions.push(`a.user_id = $${params.length}`);
  }
  if (action) {
    params.push(action.toUpperCase());
    conditions.push(`a.action = $${params.length}`);
  }
  if (startDate) {
    params.push(startDate);
    conditions.push(`a.created_at >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`a.created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT a.id, a.user_id, u.email, a.action, a.entity_type, a.entity_id,
              a.metadata, a.ip_address, a.created_at
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    ),
    pool.query(`SELECT COUNT(*) FROM audit_logs a ${where}`, params),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    logs: dataResult.rows,
    total,
    page: parsedPage,
    limit: parsedLimit,
  };
};

const insertAuditLog = async ({ user_id, action, entity_type = null, entity_id = null, metadata = null, ip_address = null }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user_id || null, action, entity_type, entity_id, metadata ? JSON.stringify(metadata) : null, ip_address]
    );
  } catch (err) {
    console.error('insertAuditLog error:', err.message);
  }
};

const getAllTransactions = async ({ search, type, startDate, endDate, page = 1, limit = 15 }) => {
  const parsedLimit = Math.min(parseInt(limit) || 15, 100);
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const conditions = [];
  const params = [];

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(`t.description ILIKE $${params.length}`);
  }
  if (type) {
    params.push(type);
    conditions.push(`t.type = $${params.length}`);
  }
  if (startDate) {
    params.push(startDate);
    conditions.push(`t.transaction_date >= $${params.length}`);
  }
  if (endDate) {
    params.push(endDate);
    conditions.push(`t.transaction_date <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT t.id, t.user_id, u.email AS user_email, t.category_id, c.name AS category_name,
              t.type, t.amount, t.description, t.transaction_date, t.payment_source, t.created_at
       FROM transactions t
       LEFT JOIN users u ON u.id = t.user_id
       LEFT JOIN categories c ON c.id = t.category_id
       ${where}
       ORDER BY t.transaction_date DESC, t.id DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    ),
    pool.query(`SELECT COUNT(*) FROM transactions t ${where}`, params),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    data: dataResult.rows,
    pagination: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
  };
};

const getAllRecurring = async ({ page = 1, limit = 50 }) => {
  const parsedLimit = Math.min(parseInt(limit) || 50, 200);
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT r.id, r.user_id, u.email AS user_email, r.category_id, c.name AS category_name,
              r.type, r.amount, r.description, r.frequency,
              r.start_date, r.end_date, r.next_run_date, r.last_run_date,
              r.is_active, r.payment_source, r.created_at
       FROM recurring_transactions r
       LEFT JOIN users u ON u.id = r.user_id
       LEFT JOIN categories c ON c.id = r.category_id
       ORDER BY r.created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`
    ),
    pool.query(`SELECT COUNT(*) FROM recurring_transactions`),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    data: dataResult.rows,
    pagination: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
  };
};

module.exports = { getAllUsers, getUserById, blockUser, deleteUser, getDashboardStats, getAuditLogs, insertAuditLog, getAllTransactions, getAllRecurring };
