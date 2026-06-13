const Shipment = require("../models/Shipment");
const Notification = require("../models/Notification");


// Exporter opens link → get shipment info
exports.getShipmentByToken = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ accessToken: req.params.token });
    if (!shipment) return res.status(404).json({ error: "Invalid or expired link" });
    res.json({
      shipmentId: shipment.shipmentId,
      product: shipment.product,
      origin: shipment.origin,
      destination: shipment.destination,
      status: shipment.status,
      alreadySubmitted: shipment.status !== "invite_sent",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Exporter submits details
exports.submitExporterDetails = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ accessToken: req.params.token });
    if (!shipment) return res.status(404).json({ error: "Invalid link" });
    shipment.exporterDetails = { ...req.body, submittedAt: new Date() };
    shipment.exporterName = req.body.name;
    await shipment.save();

    // ✅ Notification with PIN
    await Notification.create({
      forwarderId: shipment.forwarderId,
      shipmentId: shipment._id,
      type: "docs_uploaded",
      message: `📦 ${req.body.name || "Exporter"} ne form submit kiya — PIN: ${shipment.exporterPin} — Shipment: ${shipment.shipmentId}`,
    });

    res.json({ message: "Details saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};