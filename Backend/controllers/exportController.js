const { exportCSV, exportPDF } = require('../services/exportService');

const VALID_TYPES = ['income', 'expense'];
const VALID_SOURCES = ['cash', 'online', 'credit_card'];

const sanitize = (str) => String(str).replace(/[<>"']/g, '');

const extractFilters = (query) => {
  const { search, category_id, type, startDate, endDate, minAmount, maxAmount, payment_source } = query;
  return { search, category_id, type, startDate, endDate, minAmount, maxAmount, payment_source };
};

const validateFilters = ({ type, minAmount, maxAmount, startDate, endDate, category_id, payment_source }) => {
  if (type && !VALID_TYPES.includes(type)) return 'Invalid type. Must be income or expense.';
  if (payment_source && !VALID_SOURCES.includes(payment_source)) return 'Invalid payment_source. Must be cash, online, or credit_card.';
  if (category_id && (isNaN(category_id) || parseInt(category_id) <= 0)) return 'category_id must be a positive integer.';
  if (minAmount && isNaN(minAmount)) return 'minAmount must be a number.';
  if (maxAmount && isNaN(maxAmount)) return 'maxAmount must be a number.';
  if (minAmount && maxAmount && parseFloat(minAmount) > parseFloat(maxAmount))
    return 'minAmount cannot be greater than maxAmount.';
  if (startDate && isNaN(Date.parse(startDate))) return 'Invalid startDate.';
  if (endDate && isNaN(Date.parse(endDate))) return 'Invalid endDate.';
  if (startDate && endDate && new Date(startDate) > new Date(endDate))
    return 'startDate cannot be after endDate.';
  return null;
};

exports.downloadCSV = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const error = validateFilters(filters);
    if (error) return res.status(400).json({ error: sanitize(error) });

    const csv = await exportCSV(req.user.id, req.user.email, filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

exports.downloadPDF = async (req, res, next) => {
  try {
    const filters = extractFilters(req.query);
    const error = validateFilters(filters);
    if (error) return res.status(400).json({ error: sanitize(error) });

    const pdfBuffer = await exportPDF(req.user.id, req.user.email, filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.pdf');
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};
