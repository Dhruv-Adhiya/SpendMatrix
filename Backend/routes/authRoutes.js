const express = require('express');
const { register, registerAdmin, login, forgotPasswordHandler, resetPasswordHandler, verifyEmailHandler } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
router.get('/verify-email', verifyEmailHandler);

module.exports = router;
