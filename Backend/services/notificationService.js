const pool = require('../config/db');
const { getSettings } = require('./settingsService');

const createNotification = async ({ user_id, title, message, type, metadata = null, unique_key = null }) => {
  try {
    const settings = await getSettings(user_id);
    if (!settings.notification_enabled) return;

    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, metadata, unique_key)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (unique_key) WHERE unique_key IS NOT NULL DO NOTHING`,
      [user_id, title, message, type, metadata ? JSON.stringify(metadata) : null, unique_key]
    );
  } catch (err) {
    // Non-critical: log but never crash the caller
    console.error('createNotification error:', err.message);
  }
};

const getNotifications = async (userId, { page = 1, limit = 20, is_read } = {}) => {
  const parsedLimit = Math.min(parseInt(limit) || 20, 50);
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const params = [userId];
  let filterClause = '';
  if (is_read !== undefined && is_read !== '') {
    filterClause = ` AND is_read = $2`;
    params.push(is_read === 'true' || is_read === true);
  }

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT id, title, message, type, is_read, metadata, created_at
       FROM notifications
       WHERE user_id = $1${filterClause}
       ORDER BY created_at DESC
       LIMIT ${parsedLimit} OFFSET ${offset}`,
      params
    ),
    pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1${filterClause}`,
      params
    ),
  ]);

  const total = parseInt(countResult.rows[0].count);
  return {
    data: dataResult.rows,
    pagination: { total, page: parsedPage, limit: parsedLimit, totalPages: Math.ceil(total / parsedLimit) },
  };
};

const markAsRead = async (userId, notificationId) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notificationId, userId]
  );
  return result.rows.length > 0;
};

const markAllAsRead = async (userId) => {
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
};

const deleteNotification = async (userId, notificationId) => {
  const result = await pool.query(
    `DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id`,
    [notificationId, userId]
  );
  return result.rows.length > 0;
};

// ── Trigger helpers ──────────────────────────────────────────────

const notifyTransactionCreated = (userId, { id, amount, type, category_name }) => {
  const action = type === 'expense' ? 'spent on' : 'received from';
  return createNotification({
    user_id: userId,
    title: 'Transaction Added',
    message: `₹${amount} ${action} ${category_name}`,
    type: 'TRANSACTION_CREATED',
    metadata: { transaction_id: id, amount, category: category_name },
  });
};

const notifyRecurringExecuted = (userId, rule, transactionDate) => {
  return createNotification({
    user_id: userId,
    title: 'Recurring Transaction Processed',
    message: `Your recurring transaction "${rule.description || 'payment'}" of ₹${rule.amount} was processed`,
    type: 'RECURRING_EXECUTED',
    metadata: { recurring_id: rule.id, amount: rule.amount, description: rule.description },
    unique_key: `recurring_executed_${rule.id}_${transactionDate}`,
  });
};

const notifyUpcomingRecurring = (userId, rule) => {
  return createNotification({
    user_id: userId,
    title: 'Upcoming Recurring Payment',
    message: `Your recurring transaction "${rule.description || 'payment'}" of ₹${rule.amount} is due tomorrow`,
    type: 'UPCOMING_RECURRING',
    metadata: { recurring_id: rule.id, amount: rule.amount, description: rule.description, due_date: rule.next_run_date },
    unique_key: `upcoming_recurring_${rule.id}_${rule.next_run_date}`,
  });
};

const notifyBudgetAlert = async (userId, { category_id, category_name, budget, spent, month, year }) => {
  const settings = await getSettings(userId);
  const threshold = settings.budget_alert_threshold;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  if (pct < threshold) return Promise.resolve();

  const exceeded = pct >= 100;
  const title = exceeded ? 'Budget Exceeded' : 'Budget Alert';
  const message = exceeded
    ? `You have exceeded your ${category_name} budget for ${month}/${year}`
    : `You have used ${pct}% of your ${category_name} budget for ${month}/${year}`;

  return createNotification({
    user_id: userId,
    title,
    message,
    type: 'BUDGET_ALERT',
    metadata: { category_id, category_name, budget, spent, percentage: pct, month, year },
    unique_key: `budget_alert_${userId}_${category_id}_${month}_${year}_${exceeded ? '100' : '80'}`,
  });
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyTransactionCreated,
  notifyRecurringExecuted,
  notifyUpcomingRecurring,
  notifyBudgetAlert,
};
