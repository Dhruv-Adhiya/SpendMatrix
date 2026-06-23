const pool = require('../config/db');
const { getSettings } = require('./settingsService');

const getNextRunDate = (currentDate, frequency) => {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'daily':   date.setDate(date.getDate() + 1); break;
    case 'weekly':  date.setDate(date.getDate() + 7); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'yearly':  date.setFullYear(date.getFullYear() + 1); break;
    default: throw new Error(`Invalid frequency: ${frequency}`);
  }
  return date;
};

// Returns YYYY-MM-DD string from a Date object (timezone-safe)
const toDateString = (date) => date.toISOString().split('T')[0];

const processRecurring = async () => {
  const client = await pool.connect();
  let processed = 0;

  try {
    await client.query('BEGIN');

    // Fetch due rules with row locking — skips rows locked by concurrent requests
    const { rows: rules } = await client.query(
      `SELECT * FROM recurring_transactions
       WHERE next_run_date <= CURRENT_DATE
       AND is_active = TRUE
       AND (end_date IS NULL OR end_date >= CURRENT_DATE)
       FOR UPDATE SKIP LOCKED`
    );

    for (const rule of rules) {
      try {
        // Get user's timezone from settings for accurate "today" calculation
        const userSettings = await getSettings(rule.user_id);
        const tz = userSettings.timezone || 'UTC';
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
        const today = new Date(todayStr);

        let runDate = new Date(toDateString(new Date(rule.next_run_date)));

        // Catch-up logic: process all missed runs up to today
        while (runDate <= today) {
          const endDate = rule.end_date ? new Date(toDateString(new Date(rule.end_date))) : null;

          // Stop if this run date is past the end_date
          if (endDate && runDate > endDate) break;

          const runDateStr = toDateString(runDate);

          await client.query(
            `INSERT INTO transactions
             (user_id, category_id, type, amount, description, transaction_date, payment_source)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              rule.user_id,
              rule.category_id,
              rule.type,
              rule.amount,
              rule.description,
              runDateStr,
              rule.payment_source,
            ]
          );

          const nextDate = getNextRunDate(runDate, rule.frequency);

          await client.query(
            `UPDATE recurring_transactions
             SET last_run_date = $1,
                 next_run_date = $2
             WHERE id = $3`,
            [runDateStr, toDateString(nextDate), rule.id]
          );

          runDate = nextDate;
        }

        processed++;
      } catch (ruleError) {
        // Log per-rule error but continue processing other rules
        console.error(`Error processing recurring rule ID ${rule.id}:`, ruleError.message);
        throw ruleError; // Re-throw to trigger outer ROLLBACK
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Recurring processor error, transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release();
  }

  return processed;
};

module.exports = { processRecurring };
