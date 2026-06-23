const pool = require('../config/db');

exports.searchTransactions = async (userId, filters) => {
  const {
    search,
    category_id,
    type,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'date',
    order = 'desc',
    page = 1,
    limit = 10,
  } = filters;

  const params = [userId];
  let paramCount = 2;
  let conditions = '';

  if (search && search.trim()) {
    conditions += ` AND description ILIKE $${paramCount++}`;
    params.push(`%${search.trim()}%`);
  }

  if (category_id) {
    conditions += ` AND category_id = $${paramCount++}`;
    params.push(category_id);
  }

  if (type) {
    conditions += ` AND type = $${paramCount++}`;
    params.push(type);
  }

  if (startDate) {
    conditions += ` AND transaction_date >= $${paramCount++}`;
    params.push(startDate);
  }

  if (endDate) {
    conditions += ` AND transaction_date <= $${paramCount++}`;
    params.push(endDate);
  }

  if (minAmount) {
    conditions += ` AND amount >= $${paramCount++}`;
    params.push(minAmount);
  }

  if (maxAmount) {
    conditions += ` AND amount <= $${paramCount++}`;
    params.push(maxAmount);
  }

  const baseWhere = `FROM transactions WHERE user_id = $1${conditions}`;

  const sortColumn = sortBy === 'amount' ? 'amount' : 'transaction_date';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  const parsedLimit = Math.min(parseInt(limit) || 10, 50);
  const parsedPage = Math.max(parseInt(page) || 1, 1);
  const offset = (parsedPage - 1) * parsedLimit;

  const dataQuery = `SELECT * ${baseWhere} ORDER BY ${sortColumn} ${sortOrder} LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  const countQuery = `SELECT COUNT(*) ${baseWhere}`;

  const dataParams = [...params, parsedLimit, offset];
  const countParams = [...params];

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, dataParams),
    pool.query(countQuery, countParams),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    data: dataResult.rows,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};
