const pool = require('../config/db');
const {
  getAllUsers, getUserById, blockUser, deleteUser,
  getDashboardStats, getAuditLogs, insertAuditLog,
  getAllTransactions, getAllRecurring,
} = require('../services/adminService');

const getIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

// GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const result = await getAllUsers(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/users/:id
const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/admin/users/:id/block
const toggleBlock = async (req, res) => {
  try {
    const { is_blocked } = req.body;
    if (typeof is_blocked !== 'boolean') {
      return res.status(400).json({ error: 'is_blocked must be a boolean' });
    }

    const user = await blockUser(req.params.id, is_blocked);
    if (!user) return res.status(404).json({ error: 'User not found or cannot block an admin' });

    await insertAuditLog({
      user_id: req.user.id,
      action: is_blocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      entity_type: 'user',
      metadata: { target_user_id: req.params.id },
      ip_address: getIp(req),
    });

    res.json({ message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/admin/users/:id
const removeUser = async (req, res) => {
  try {
    const deleted = await deleteUser(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    await insertAuditLog({
      user_id: req.user.id,
      action: 'USER_DELETED',
      entity_type: 'user',
      metadata: { target_user_id: req.params.id },
      ip_address: getIp(req),
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err.message === 'SELF_DELETE') return res.status(400).json({ error: 'Cannot delete your own account' });
    if (err.message === 'DELETE_ADMIN') return res.status(400).json({ error: 'Cannot delete another admin' });
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/dashboard
const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/logs
const auditLogs = async (req, res) => {
  try {
    const result = await getAuditLogs(req.query);
    res.json(result);
  } catch (err) {
    if (err.status === 400) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/transactions
const listTransactions = async (req, res) => {
  try {
    const result = await getAllTransactions(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/recurring
const listRecurring = async (req, res) => {
  try {
    const result = await getAllRecurring(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// PATCH /api/admin/recurring/:id/toggle
const toggleRecurring = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid id required' });
    }
    const check = await pool.query(
      'SELECT id, is_active FROM recurring_transactions WHERE id = $1',
      [parseInt(id)]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Recurring rule not found' });
    }
    const newState = !check.rows[0].is_active;
    const result = await pool.query(
      'UPDATE recurring_transactions SET is_active = $1 WHERE id = $2 RETURNING *',
      [newState, parseInt(id)]
    );
    res.json({ success: true, message: `Rule ${newState ? 'enabled' : 'disabled'} successfully`, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { listUsers, getUser, toggleBlock, removeUser, dashboard, auditLogs, listTransactions, listRecurring, toggleRecurring };
