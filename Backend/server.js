require('dotenv').config();
const express = require("express");
const pool = require("./config/db");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const cronRoutes = require('./routes/cronRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const exportRoutes = require('./routes/exportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter, authLimiter, adminLimiter } = require('./middleware/rateLimiter');
const { startRecurringJob } = require('./jobs/recurringJob');

const app = express();
app.use(express.json());
app.use(globalLimiter);
const PORT = 5000;

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("DB connection failed", err);
  } else {
    console.log("DB connected👍 :", res.rows[0]);
  }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startRecurringJob();
});