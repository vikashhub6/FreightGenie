const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  forwarderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: "Company" }, // ✅ multi-tenant filter
  shipmentId:  { type: String, unique: true },
  exporterPin: { type: String, unique: true, sparse: true },
  exporterEmail: { type: String, required: true },
  exporterName:  { type: String },
  product:       { type: String, required: true },
  origin:        { type: String, required: true },
  destination:   { type: String, required: true },
  cargoType:     { type: String, default: "general" },
  accessToken:   { type: String, unique: true },

  // ── FF fills when creating shipment ─────────────────────────
  shipmentInfo: {
    consigneeName:    String,   // buyer ka naam
    consigneeAddress: String,   // buyer ka address
    consigneeCountry: String,
    notifyParty:      String,   // usually same as consignee
    paymentTerms:     { type: String, enum: ["FOB","CIF","EXW","CFR","DDP","DAP"], default: "FOB" },
    shippingMode:     { type: String, enum: ["sea","air","road","rail"], default: "sea" },
    incoterms:        String,
    portOfLoading:    String,
    portOfDischarge:  String,
    expectedShipDate: Date,
    eta:              Date,
    specialInstructions: String,
  },

  // ── Exporter fills when submitting details ────────────────────
  exporterDetails: {
    name:           String,
    company:        String,
    phone:          String,
    address:        String,
    gstNumber:      String,   // GST / Tax ID
    iecCode:        String,   // IEC Certificate number
    bankName:       String,   // for LC / payment
    // Cargo details exporter confirms
    invoiceNumber:  String,
    invoiceValue:   String,   // USD amount
    invoiceCurrency:{ type: String, default: "USD" },
    packageCount:   Number,
    grossWeight:    String,   // in KGS
    netWeight:      String,
    volume:         String,   // CBM
    hsCode:         String,   // if exporter knows
    submittedAt:    Date,
  },

  status: {
    type: String,
    enum: ["pending","invite_sent","docs_uploaded","ai_analyzing","awaiting_review","compliance_done","email_sent","completed"],
    default: "pending",
  },

  documents: [{
    name:              String,
    originalName:      String,
    path:              String,
    cloudinaryUrl:     String,
    cloudinaryPublicId:String,
    resourceType:      String,
    type: { type: String, enum: ["invoice","packing_list","certificate","bl_draft","insurance","iec","other"] },
    uploadedAt: { type: Date, default: Date.now },
  }],

  complianceReport: {
    score:       Number,
    riskLevel:   { type: String, enum: ["low","medium","high"] },
    status:      String,
    summary:     String,
    missingDocs: [String],
    hsCode:      String,
    dutyEstimate:String,
    freightCost: String,
    totalCost:   String,
    checklist: [{
      task:       String,
      assignedTo: { type: String, enum: ["exporter","forwarder"] },
      status:     { type: String, enum: ["ok","warning","missing"] },
    }],
    issues:          [String],
    suggestions:     [String],
    expiryAlerts:    [{ doc: String, date: String }],
    regulatoryNotes: String,
    generatedAt:     Date,
    reviewedAt:      Date,
    reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },

  emailDraft: {
    subject:    String,
    body:       String,
    editedBody: String,
    sentAt:     Date,
    sentTo:     String,
  },

  // ── Phase 2 Analytics — auto-saved when compliance_done ──────
  analytics: {
    route:             String,   // "Mumbai → Dubai"
    shippingMode:      String,
    cargoType:         String,
    hsCode:            String,
    grossWeight:       String,
    volume:            String,
    invoiceValue:      String,
    freightCost:       String,
    dutyEstimate:      String,
    totalCost:         String,
    complianceScore:   Number,
    riskLevel:         String,
    totalDocs:         Number,
    missingDocsCount:  Number,
    issuesCount:       Number,
    paymentTerms:      String,
    shipmentMonth:     String,
    shipmentYear:      Number,
    savedAt:           Date,
  },

  pdfReportPath:        String,
  bookingPdfPath:       String,   // Booking Confirmation PDF
  freightInvoicePath:   String,   // Freight Invoice PDF

  statusHistory: [{ status: String, message: String, timestamp: { type: Date, default: Date.now } }],
}, { timestamps: true });

shipmentSchema.pre("save", function (next) {
  if (!this.shipmentId) this.shipmentId = "SC-" + Date.now().toString().slice(-6);
  if (!this.exporterPin) this.exporterPin = "SC-" + Math.floor(1000 + Math.random() * 9000);
  next();
});

module.exports = mongoose.model("Shipment", shipmentSchema);
