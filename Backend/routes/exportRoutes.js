const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { downloadCSV, downloadPDF } = require('../controllers/exportController');

router.use(authMiddleware);

router.get('/csv', downloadCSV);
router.get('/pdf', downloadPDF);

module.exports = router;
