const Shipment = require("../models/Shipment");
const { sendComplianceEmail, sendMissingDocsAlert } = require("../services/emailService");

exports.saveEditedDraft = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const shipment = await Shipment.findOne({ _id: req.params.id, forwarderId: req.user._id });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    shipment.emailDraft.editedBody = body;
    shipment.emailDraft.subject = subject;
    await shipment.save();
    res.json({ message: "Draft saved", shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendEmail = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, forwarderId: req.user._id });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.emailDraft?.body && !shipment.emailDraft?.editedBody)
      return res.status(400).json({ error: "No email draft found" });
    const subject = shipment.emailDraft.subject || "Compliance Report";
    const body = shipment.emailDraft.editedBody || shipment.emailDraft.body;
    const attachmentPath = shipment.pdfReportPath || null;
    await sendComplianceEmail(shipment.exporterEmail, subject, body, attachmentPath, shipment.forwarderId);
    shipment.emailDraft.sentAt = new Date();
    shipment.emailDraft.sentTo = shipment.exporterEmail;
    shipment.status = "email_sent";
    shipment.statusHistory.push({ status: "email_sent", message: `Email sent to ${shipment.exporterEmail}` });
    await shipment.save();
    res.json({ message: "Email sent!", shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendMissingDocsAlert = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id, forwarderId: req.user._id });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    const missingDocs = shipment.complianceReport?.missingDocs || [];
    if (!missingDocs.length) return res.status(400).json({ error: "No missing docs found" });
    await sendMissingDocsAlert(shipment.exporterEmail, missingDocs, shipment.shipmentId, shipment.forwarderId);
    res.json({ message: "Missing docs alert sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};