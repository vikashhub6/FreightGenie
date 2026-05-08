// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  forwarderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shipmentId:  { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true },
  type: {
    type: String,
    enum: ["docs_uploaded", "ai_done", "missing_docs", "expiry_alert"],
    required: true,
  },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
