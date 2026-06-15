const crypto = require("crypto");
const Shipment = require("../models/Shipment");
const { sendInviteEmail } = require("../services/emailService");
const { generateBookingConfirmation } = require("../services/bookingPdfService");

// Helper — company ke sabhi users ke forwarderIds get karo
async function getCompanyForwarderIds(companyId) {
  const User = require("../models/User");
  const users = await User.find({ companyId, status: "active" }).select("_id");
  return users.map((u) => u._id);
}

exports.createShipment = async (req, res) => {
  try {
    const { exporterEmail, product, origin, destination, cargoType, shipmentInfo } = req.body;
    const accessToken = crypto.randomBytes(32).toString("hex");
    const shipment = await Shipment.create({
      forwarderId: req.user._id,
      companyId: req.user.companyId,   // ✅ companyId add
      exporterEmail,
      product,
      origin,
      destination,
      cargoType,
      shipmentInfo: shipmentInfo || {},
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

    try {
      const bookingPath = await generateBookingConfirmation(shipment);
      shipment.bookingPdfPath = bookingPath;
      await shipment.save();
    } catch (pdfErr) { console.error("Booking PDF error:", pdfErr.message); }

    res.status(201).json({ message: "Shipment created & invite sent!", shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    // ✅ Company ke SABHI active users ki shipments dikhao
    const forwarderIds = await getCompanyForwarderIds(req.user.companyId);
    const shipments = await Shipment.find({
      $or: [
        { companyId: req.user.companyId },     // new shipments (companyId set hai)
        { forwarderId: { $in: forwarderIds } }, // old shipments (companyId nahi tha)
      ]
    }).sort({ createdAt: -1 });
    res.json(shipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShipment = async (req, res) => {
  try {
    const forwarderIds = await getCompanyForwarderIds(req.user.companyId);
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      $or: [
        { companyId: req.user.companyId },
        { forwarderId: { $in: forwarderIds } },
      ],
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchByPin = async (req, res) => {
  try {
    const { pin } = req.params;
    const forwarderIds = await getCompanyForwarderIds(req.user.companyId);
    const shipment = await Shipment.findOne({
      exporterPin: pin.toUpperCase(),
      $or: [
        { companyId: req.user.companyId },
        { forwarderId: { $in: forwarderIds } },
      ],
    });
    if (!shipment) return res.status(404).json({ error: "No shipment found with this PIN" });
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.downloadBookingPDF = async (req, res) => {
  try {
    const forwarderIds = await getCompanyForwarderIds(req.user.companyId);
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      $or: [{ companyId: req.user.companyId }, { forwarderId: { $in: forwarderIds } }],
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.bookingPdfPath) return res.status(404).json({ error: "Booking PDF not generated yet" });
    const fs = require("fs");
    if (!fs.existsSync(shipment.bookingPdfPath)) return res.status(404).json({ error: "File not found on server" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="booking-${shipment.shipmentId}.pdf"`);
    fs.createReadStream(shipment.bookingPdfPath).pipe(res);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const forwarderIds = await getCompanyForwarderIds(req.user.companyId);
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      $or: [{ companyId: req.user.companyId }, { forwarderId: { $in: forwarderIds } }],
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.freightInvoicePath) return res.status(404).json({ error: "Invoice PDF not generated yet" });
    const fs = require("fs");
    if (!fs.existsSync(shipment.freightInvoicePath)) return res.status(404).json({ error: "File not found on server" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="invoice-${shipment.shipmentId}.pdf"`);
    fs.createReadStream(shipment.freightInvoicePath).pipe(res);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
