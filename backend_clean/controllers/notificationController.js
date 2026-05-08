const Notification = require("../models/Notification");

// Get all notifications for logged-in forwarder
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ forwarderId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("shipmentId", "exporterPin shipmentId exporterName exporterEmail product");
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark one as read
exports.markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ forwarderId: req.user._id, read: false }, { read: true });
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
