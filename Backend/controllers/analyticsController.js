const pool = require('../config/db');

// GET /api/analytics/payment-source-breakdown
exports.getPaymentSourceBreakdown = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT payment_source, SUM(amount) AS total
       FROM transactions
       WHERE type='expense' AND user_id=$1
       GROUP BY payment_source`,
      [req.user.id]
    );

    const data = {};
    result.rows.forEach(row => {
      data[row.payment_source] = parseFloat(row.total);
    });

    res.json({ success: true, message: 'Payment source breakdown retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/monthly-summary?month=6&year=2025
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year, payment_source } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
        data: null
      });
    }

    if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year format',
        data: null
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12',
        data: null
      });
    }

    if (yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year',
        data: null
      });
    }

    const params = [req.user.id, monthNum, yearNum];
    let psFilter = '';
    if (payment_source) {
      params.push(payment_source);
      psFilter = `AND payment_source = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS total_expense
      FROM transactions
      WHERE user_id = $1
      AND EXTRACT(MONTH FROM transaction_date) = $2
      AND EXTRACT(YEAR FROM transaction_date) = $3
      ${psFilter}`,
      params
    );

    const totalIncome = parseFloat(result.rows[0].total_income) || 0;
    const totalExpense = parseFloat(result.rows[0].total_expense) || 0;
    const savings = totalIncome - totalExpense;

    res.json({
      success: true,
      message: 'Monthly summary retrieved successfully',
      data: {
        month: monthNum,
        year: yearNum,
        total_income: totalIncome,
        total_expense: totalExpense,
        savings
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/category-breakdown?month=6&year=2025
exports.getCategoryBreakdown = async (req, res, next) => {
  try {
    const { month, year, payment_source } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
        data: null
      });
    }

    if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year format',
        data: null
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12',
        data: null
      });
    }

    if (yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year',
        data: null
      });
    }

    const params = [req.user.id, monthNum, yearNum];
    let psFilter = '';
    if (payment_source) {
      params.push(payment_source);
      psFilter = `AND t.payment_source = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
        c.id AS category_id,
        c.name AS category_name,
        SUM(t.amount) AS total_spent
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
      AND t.type = 'expense'
      AND EXTRACT(MONTH FROM t.transaction_date) = $2
      AND EXTRACT(YEAR FROM t.transaction_date) = $3
      ${psFilter}
      GROUP BY c.id, c.name
      ORDER BY total_spent DESC`,
      params
    );

    const breakdown = result.rows.map(row => ({
      category_id: row.category_id,
      category_name: row.category_name,
      total_spent: parseFloat(row.total_spent)
    }));

    res.json({
      success: true,
      message: 'Category breakdown retrieved successfully',
      data: breakdown
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/budget-vs-actual?month=6&year=2025
exports.getBudgetVsActual = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
        data: null
      });
    }

    if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year format',
        data: null
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12',
        data: null
      });
    }

    if (yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year',
        data: null
      });
    }

    const result = await pool.query(
      `SELECT
        b.category_id,
        c.name AS category_name,
        b.amount AS budget_amount,
        COALESCE(SUM(t.amount), 0) AS spent_amount
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.category_id = b.category_id
        AND t.user_id = b.user_id
        AND t.type = 'expense'
        AND EXTRACT(MONTH FROM t.transaction_date) = b.month
        AND EXTRACT(YEAR FROM t.transaction_date) = b.year
      WHERE b.user_id = $1
      AND b.month = $2
      AND b.year = $3
      GROUP BY b.category_id, c.name, b.amount
      ORDER BY c.name`,
      [req.user.id, monthNum, yearNum]
    );

    const comparison = result.rows.map(row => {
      const budgetAmount = parseFloat(row.budget_amount);
      const spentAmount = parseFloat(row.spent_amount);
      const remaining = budgetAmount - spentAmount;
      const percentageUsed = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

      return {
        category_id: row.category_id,
        category_name: row.category_name,
        budget_amount: budgetAmount,
        spent_amount: spentAmount,
        remaining,
        percentage_used: parseFloat(percentageUsed.toFixed(2))
      };
    });

    res.json({
      success: true,
      message: 'Budget vs actual comparison retrieved successfully',
      data: comparison
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/daily-expense?month=6&year=2025
exports.getDailyExpense = async (req, res, next) => {
  try {
    const { month, year, payment_source } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
        data: null
      });
    }

    if (!/^\d+$/.test(month) || !/^\d+$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month or year format',
        data: null
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 1 and 12',
        data: null
      });
    }

    if (yearNum < 1900 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year',
        data: null
      });
    }

    const params = [req.user.id, monthNum, yearNum];
    let psFilter = '';
    if (payment_source) {
      params.push(payment_source);
      psFilter = `AND payment_source = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
        transaction_date,
        SUM(amount) AS total_expense
      FROM transactions
      WHERE user_id = $1
      AND type = 'expense'
      AND EXTRACT(MONTH FROM transaction_date) = $2
      AND EXTRACT(YEAR FROM transaction_date) = $3
      ${psFilter}
      GROUP BY transaction_date
      ORDER BY transaction_date`,
      params
    );

    const dailyExpenses = result.rows.map(row => ({
      date: row.transaction_date,
      total_expense: parseFloat(row.total_expense)
    }));

    res.json({
      success: true,
      message: 'Daily expense trend retrieved successfully',
      data: dailyExpenses
    });
  } catch (error) {
    next(error);
  }
};
