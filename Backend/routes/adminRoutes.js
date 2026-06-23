const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { listUsers, getUser, toggleBlock, removeUser, dashboard, auditLogs, listTransactions, listRecurring, toggleRecurring } = require('../controllers/adminController');

router.use(adminMiddleware);

router.get('/dashboard', dashboard);
router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/block', toggleBlock);
router.delete('/users/:id', removeUser);
router.get('/logs', auditLogs);
router.get('/transactions', listTransactions);
router.get('/recurring', listRecurring);
router.patch('/recurring/:id/toggle', toggleRecurring);

module.exports = router;
