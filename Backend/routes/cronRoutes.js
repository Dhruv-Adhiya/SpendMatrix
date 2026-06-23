const express = require('express');
const router = express.Router();
const { runRecurring } = require('../controllers/cronController');

router.post('/run-recurring', runRecurring);

module.exports = router;
