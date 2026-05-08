const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();

async function getTransporter(forwarderId) {
  const forwarder = await User.findById(forwarderId);
  const emailUser = forwarder?.companyEmail || process.env.EMAIL_USER;
  const emailPass = forwarder?.companyEmailPassword || process.env.EMAIL_PASS;
  const fromName = forwarder?.company || "ShipChain";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });
  return { transporter, emailUser, fromName };
}

async function sendInviteEmail(to, accessLink, shipmentInfo, forwarderId) {
  const { transporter, emailUser, fromName } = await getTransporter(forwarderId);
  await transporter.sendMail({
    from: `"${fromName}" <${emailUser}>`,
    to,
    subject: `Action Required: Upload Documents for Shipment ${shipmentInfo.shipmentId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#2563eb;">📦 Document Upload Request</h2>
        <p>Dear Exporter,</p>
        <p>You have been requested to upload shipping documents for the following shipment:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr style="background:#f1f5f9;"><td style="padding:10px;font-weight:bold;">Product</td><td style="padding:10px;">${shipmentInfo.product}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Origin</td><td style="padding:10px;">${shipmentInfo.origin}</td></tr>
          <tr style="background:#f1f5f9;"><td style="padding:10px;font-weight:bold;">Destination</td><td style="padding:10px;">${shipmentInfo.destination}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Shipment ID</td><td style="padding:10px;font-family:monospace;">${shipmentInfo.shipmentId}</td></tr>
          <tr style="background:#eff6ff;"><td style="padding:10px;font-weight:bold;color:#2563eb;">Your PIN</td><td style="padding:10px;font-family:monospace;font-size:18px;font-weight:bold;color:#2563eb;">${shipmentInfo.exporterPin}</td></tr>
        </table>
        <p style="background:#eff6ff;padding:12px;border-radius:8px;color:#1e40af;">
          📌 <strong>Save your PIN: ${shipmentInfo.exporterPin}</strong> — Share this with your freight forwarder for tracking.
        </p>
        <a href="${accessLink}" style="display:inline-block;background:#2563eb;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin-top:12px;">Upload Documents →</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">This is a secure unique link. Sent by ${fromName}</p>
      </div>`,
  });
}

async function sendComplianceEmail(to, subject, body, attachmentPath, forwarderId) {
  const { transporter, emailUser, fromName } = await getTransporter(forwarderId);
  const mailOptions = {
    from: `"${fromName}" <${emailUser}>`,
    to,
    subject,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;white-space:pre-wrap;">${body.replace(/\n/g, "<br/>")}</div>`,
  };
  if (attachmentPath) mailOptions.attachments = [{ filename: "compliance-report.pdf", path: attachmentPath }];
  await transporter.sendMail(mailOptions);
}

async function sendMissingDocsAlert(to, missingDocs, shipmentId, forwarderId) {
  const { transporter, emailUser, fromName } = await getTransporter(forwarderId);
  await transporter.sendMail({
    from: `"${fromName}" <${emailUser}>`,
    to,
    subject: `⚠️ Missing Documents Alert — Shipment ${shipmentId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #fca5a5;border-radius:12px;">
        <h2 style="color:#dc2626;">⚠️ Missing Documents Alert</h2>
        <p>The following documents are missing for Shipment <strong>${shipmentId}</strong>:</p>
        <ul style="background:#fef2f2;padding:16px 24px;border-radius:8px;">
          ${missingDocs.map((d) => `<li style="color:#dc2626;margin:6px 0;">${d}</li>`).join("")}
        </ul>
        <p>Please upload the missing documents at the earliest to avoid delays.</p>
        <p style="color:#94a3b8;font-size:12px;">Sent by ${fromName}</p>
      </div>`,
  });
}

async function sendUploadAlertEmail(shipment) {
  try {
    const { transporter, emailUser, fromName } = await getTransporter(shipment.forwarderId);
    const forwarderUser = await User.findById(shipment.forwarderId);
    if (!forwarderUser?.email) return;
    await transporter.sendMail({
      from: `"${fromName}" <${emailUser}>`,
      to: forwarderUser.email,
      subject: `📤 Documents Uploaded — ${shipment.shipmentId} | ${shipment.product}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#2563eb;">📤 New Documents Uploaded</h2>
          <p><strong>${shipment.exporterName || shipment.exporterEmail}</strong> has uploaded documents for:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr style="background:#f1f5f9;"><td style="padding:10px;font-weight:bold;">Shipment ID</td><td style="padding:10px;font-family:monospace;">${shipment.shipmentId}</td></tr>
            <tr><td style="padding:10px;font-weight:bold;">Product</td><td style="padding:10px;">${shipment.product}</td></tr>
            <tr style="background:#f1f5f9;"><td style="padding:10px;font-weight:bold;">Route</td><td style="padding:10px;">${shipment.origin} → ${shipment.destination}</td></tr>
            <tr><td style="padding:10px;font-weight:bold;">Documents</td><td style="padding:10px;">${shipment.documents?.length || 0} file(s)</td></tr>
          </table>
          <p style="background:#eff6ff;padding:12px;border-radius:8px;color:#1e40af;">
            👉 Login to your dashboard and click <strong>"Analyze"</strong> to run AI compliance check.
          </p>
          <p style="color:#94a3b8;font-size:12px;">Sent by ShipChain System</p>
        </div>`,
    });
  } catch (err) {
    console.error("Upload alert email error:", err.message);
  }
}

module.exports = { sendInviteEmail, sendComplianceEmail, sendMissingDocsAlert, sendUploadAlertEmail };
