const { getDashboardSummary } = require('../services/dashboardService');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const data = await getDashboardSummary(req.user.id);
    res.json({ success: true, message: 'Dashboard summary retrieved successfully', data });
  } catch (error) {
    next(error);
  }
};
