const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  forwarderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shipmentId: { type: String, unique: true },
  exporterPin: { type: String, unique: true, sparse: true }, // SC-XXXX PIN
  exporterEmail: { type: String, required: true },
  exporterName: { type: String },
  product: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  cargoType: { type: String, default: "general" },
  accessToken: { type: String, unique: true },
  status: {
    type: String,
    enum: ["pending", "invite_sent", "docs_uploaded", "ai_analyzing", "awaiting_review", "compliance_done", "email_sent", "completed"],
    default: "pending",
  },
  documents: [{
    name: String,
    originalName: String,
    path: String,
    cloudinaryUrl: String,
    cloudinaryPublicId: String,
    resourceType: String,
    type: { type: String, enum: ["invoice", "packing_list", "certificate", "other"] },
    uploadedAt: { type: Date, default: Date.now },
  }],
  exporterDetails: {
    name: String,
    company: String,
    phone: String,
    address: String,
    submittedAt: Date,
  },
  complianceReport: {
    score: Number,
    riskLevel: { type: String, enum: ["low", "medium", "high"] },
    status: String,
    summary: String,
    missingDocs: [String],
    hsCode: String,
    dutyEstimate: String,
    freightCost: String,
    totalCost: String,
    checklist: [{
      task: String,
      assignedTo: { type: String, enum: ["exporter", "forwarder"] },
      status: { type: String, enum: ["ok", "warning", "missing"] },
    }],
    issues: [String],
    suggestions: [String],
    expiryAlerts: [{ doc: String, date: String }],
    generatedAt: Date,
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  emailDraft: {
    subject: String,
    body: String,
    editedBody: String,
    sentAt: Date,
    sentTo: String,
  },
  pdfReportPath: String,
  statusHistory: [{ status: String, message: String, timestamp: { type: Date, default: Date.now } }],
}, { timestamps: true });

// Auto-generate shipment ID and exporterPin
shipmentSchema.pre("save", function (next) {
  if (!this.shipmentId) {
    this.shipmentId = "SC-" + Date.now().toString().slice(-6);
  }
  if (!this.exporterPin) {
    this.exporterPin = "SC-" + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model("Shipment", shipmentSchema);
