const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

router.use(authMiddleware);

router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);

module.exports = router;
