const { processRecurring } = require('../services/recurringProcessor');

const runRecurring = async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const processed = await processRecurring();
    res.json({ processed, status: 'success' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { runRecurring };
