const notificationService = require('../services/notificationService');

exports.getNotifications = async (req, res, next) => {
  try {
    const { page, limit, is_read } = req.query;
    const result = await notificationService.getNotifications(req.user.id, { page, limit, is_read });
    res.status(200).json({ success: true, message: 'Notifications fetched', data: result.data, pagination: result.pagination });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const found = await notificationService.markAsRead(req.user.id, req.params.id);
    if (!found) return res.status(404).json({ success: false, message: 'Notification not found', data: null });
    res.status(200).json({ success: true, message: 'Notification marked as read', data: null });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: 'All notifications marked as read', data: null });
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const found = await notificationService.deleteNotification(req.user.id, req.params.id);
    if (!found) return res.status(404).json({ success: false, message: 'Notification not found', data: null });
    res.status(200).json({ success: true, message: 'Notification deleted', data: null });
  } catch (error) {
    next(error);
  }
};
