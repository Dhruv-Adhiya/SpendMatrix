const pool = require('../config/db');

const getDashboardSummary = async (userId) => {
  const [totalsResult, recentResult, categoryResult, monthlyResult] = await Promise.all([
    // 1. Balance, totalIncome, totalExpense
    pool.query(
      `SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    ),

    // 2. Recent 5 transactions
    pool.query(
      `SELECT id, amount, type, category_id, description AS note, transaction_date AS date
       FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC, id DESC
       LIMIT 5`,
      [userId]
    ),

    // 3. Category breakdown (expenses only)
    pool.query(
      `SELECT
        t.category_id,
        c.name AS category_name,
        SUM(t.amount) AS total
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.user_id = $1 AND t.type = 'expense'
       GROUP BY t.category_id, c.name
       ORDER BY total DESC`,
      [userId]
    ),

    // 4. Monthly summary — last 6 months
    pool.query(
      `SELECT
        TO_CHAR(transaction_date AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
       FROM transactions
       WHERE user_id = $1
         AND transaction_date >= DATE_TRUNC('month', NOW() AT TIME ZONE 'UTC') - INTERVAL '5 months'
       GROUP BY month
       ORDER BY month ASC`,
      [userId]
    ),
  ]);

  const totalIncome = parseFloat(totalsResult.rows[0].total_income) || 0;
  const totalExpense = parseFloat(totalsResult.rows[0].total_expense) || 0;
  const balance = totalIncome - totalExpense;

  const recentTransactions = recentResult.rows.map(row => ({
    id: row.id,
    amount: parseFloat(row.amount),
    type: row.type,
    category_id: row.category_id,
    note: row.note || null,
    date: row.date,
  }));

  const categoryBreakdown = categoryResult.rows.map(row => {
    const total = parseFloat(row.total);
    return {
      category_id: row.category_id,
      category_name: row.category_name || null,
      total,
      percentage: totalExpense > 0 ? parseFloat(((total / totalExpense) * 100).toFixed(2)) : 0,
    };
  });

  const monthlySummary = monthlyResult.rows.map(row => ({
    month: row.month,
    totalIncome: parseFloat(row.total_income) || 0,
    totalExpense: parseFloat(row.total_expense) || 0,
  }));

  return { balance, totalIncome, totalExpense, recentTransactions, categoryBreakdown, monthlySummary };
};

module.exports = { getDashboardSummary };
