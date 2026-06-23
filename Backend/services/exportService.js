const pool = require('../config/db');
const { generateCSV, generatePDF } = require('../utils/fileGenerator');

const MAX_RECORDS = 5000;

const buildFilterQuery = (userId, filters) => {
  const { search, category_id, type, startDate, endDate, minAmount, maxAmount, payment_source } = filters;
  const params = [userId];
  let paramCount = 2;
  let conditions = '';

  if (search?.trim()) {
    conditions += ` AND t.description ILIKE $${paramCount++}`;
    params.push(`%${search.trim()}%`);
  }
  if (category_id) {
    conditions += ` AND t.category_id = $${paramCount++}`;
    params.push(category_id);
  }
  if (type) {
    conditions += ` AND t.type = $${paramCount++}`;
    params.push(type);
  }
  if (startDate) {
    conditions += ` AND t.transaction_date >= $${paramCount++}`;
    params.push(startDate);
  }
  if (endDate) {
    conditions += ` AND t.transaction_date <= $${paramCount++}`;
    params.push(endDate);
  }
  if (minAmount) {
    conditions += ` AND t.amount >= $${paramCount++}`;
    params.push(minAmount);
  }
  if (maxAmount) {
    conditions += ` AND t.amount <= $${paramCount++}`;
    params.push(maxAmount);
  }
  if (payment_source) {
    conditions += ` AND t.payment_source = $${paramCount++}`;
    params.push(payment_source);
  }

  params.push(MAX_RECORDS);
  const query = `
    SELECT t.*, c.name AS category_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = $1${conditions}
    ORDER BY t.transaction_date DESC
    LIMIT $${paramCount}
  `;
  return { query, params };
};

exports.exportCSV = async (userId, userEmail, filters) => {
  const { query, params } = buildFilterQuery(userId, filters);
  const { rows } = await pool.query(query, params);
  const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
  const meta = { name: userResult.rows[0]?.full_name || '', email: userEmail, filters };
  return generateCSV(rows, meta);
};

exports.exportPDF = async (userId, userEmail, filters) => {
  const { query, params } = buildFilterQuery(userId, filters);
  const { rows } = await pool.query(query, params);
  const userResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
  const meta = { name: userResult.rows[0]?.full_name || '', email: userEmail, filters };
  return generatePDF(rows, meta);
};
