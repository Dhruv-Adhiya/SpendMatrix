const cron = require('node-cron');
const pool = require('../config/db');
const { notifyRecurringExecuted, notifyUpcomingRecurring } = require('../services/notificationService');

const processRecurringTransactions = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Running recurring transactions job...');

    // Fetch rules that should run today
    const rulesResult = await client.query(
      `SELECT * FROM recurring_transactions 
      WHERE next_run_date = CURRENT_DATE 
      AND is_active = TRUE 
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)`
    );

    const rules = rulesResult.rows;
    console.log(`Found ${rules.length} recurring rules to process`);

    for (const rule of rules) {
      await client.query('BEGIN');

      try {
        // Insert transaction
        await client.query(
          `INSERT INTO transactions 
          (user_id, category_id, type, amount, description, transaction_date, payment_source) 
          VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6)`,
          [rule.user_id, rule.category_id, rule.type, rule.amount, rule.description, rule.payment_source]
        );

        // Calculate next run date
        let interval;
        switch (rule.frequency) {
          case 'daily':
            interval = '1 day';
            break;
          case 'weekly':
            interval = '7 days';
            break;
          case 'monthly':
            interval = '1 month';
            break;
          case 'yearly':
            interval = '1 year';
            break;
          default:
            throw new Error(`Invalid frequency: ${rule.frequency}`);
        }

        // Update recurring rule
        await client.query(
          `UPDATE recurring_transactions 
          SET last_run_date = CURRENT_DATE, 
              next_run_date = CURRENT_DATE + INTERVAL '${interval}' 
          WHERE id = $1`,
          [rule.id]
        );

        await client.query('COMMIT');
        notifyRecurringExecuted(rule.user_id, rule, new Date().toISOString().split('T')[0]);
        console.log(`Processed recurring rule ID: ${rule.id}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error processing rule ID ${rule.id}:`, error.message);
      }
    }

    console.log('Recurring transactions job completed');

    // Upcoming recurring reminders: rules due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const { rows: upcomingRules } = await client.query(
      `SELECT * FROM recurring_transactions
       WHERE next_run_date = $1 AND is_active = TRUE
         AND (end_date IS NULL OR end_date >= $1)`,
      [tomorrowStr]
    );

    for (const rule of upcomingRules) {
      notifyUpcomingRecurring(rule.user_id, rule);
    }
  } catch (error) {
    console.error('Error in recurring transactions job:', error.message);
  } finally {
    client.release();
  }
};

// Schedule job to run daily at midnight
const startRecurringJob = () => {
  cron.schedule('0 0 * * *', processRecurringTransactions);
  console.log('Recurring transactions job scheduled (daily at midnight)');
};

module.exports = { startRecurringJob, processRecurringTransactions };
