const crypto = require("crypto");
const Shipment = require("../models/Shipment");
const { sendInviteEmail } = require("../services/emailService");

exports.createShipment = async (req, res) => {
  try {
    const { exporterEmail, product, origin, destination, cargoType } = req.body;
    const accessToken = crypto.randomBytes(32).toString("hex");
    const shipment = await Shipment.create({
      forwarderId: req.user._id,
      exporterEmail,
      product,
      origin,
      destination,
      cargoType,
      accessToken,
      statusHistory: [{ status: "pending", message: "Shipment created" }],
    });
    const accessLink = `${process.env.FRONTEND_URL}/upload/${accessToken}`;
    await sendInviteEmail(
      exporterEmail,
      accessLink,
      { product, origin, destination, shipmentId: shipment.shipmentId, exporterPin: shipment.exporterPin },
      req.user._id
    );
    shipment.status = "invite_sent";
    shipment.statusHistory.push({ status: "invite_sent", message: `Invite sent to ${exporterEmail}` });
    await shipment.save();
    res.status(201).json({ message: "Shipment created & invite sent!", shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find({ forwarderId: req.user._id }).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, forwarderId: req.user._id });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search shipment by PIN — forwarder only
exports.searchByPin = async (req, res) => {
  try {
    const { pin } = req.params;
    const shipment = await Shipment.findOne({
      exporterPin: pin.toUpperCase(),
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "No shipment found with this PIN" });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
