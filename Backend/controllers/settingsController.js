const settingsService = require('../services/settingsService');
const { insertAuditLog } = require('../services/adminService');

const getIp = (req) => req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

exports.getSettings = async (req, res, next) => {
  try {
    const data = await settingsService.getSettings(req.user.id);
    res.status(200).json({ success: true, message: 'Settings fetched', data });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: 'Request body is empty', data: null });
    }
    const data = await settingsService.updateSettings(req.user.id, req.body);
    insertAuditLog({ user_id: req.user.id, action: 'SETTINGS_UPDATED', entity_type: 'settings', metadata: { updated_fields: Object.keys(req.body) }, ip_address: getIp(req) });
    res.status(200).json({ success: true, message: 'Settings updated', data });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};
