const Shipment = require("../models/Shipment");
const Notification = require("../models/Notification");
const {
  runFullAIAnalysis,
  generateEmailDraft,
} = require("../ai/complianceAgent");
const { generatePDFReport } = require("../services/pdfService");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

// GET compliance report
exports.getComplianceReport = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    res.json(shipment.complianceReport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FORWARDER MANUALLY CLICKS "Analyze" — tab AI chalega
exports.analyzeCompliance = async (req, res) => {
  const io = req.app.get("io");
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.documents?.length)
      return res.status(400).json({ error: "No documents uploaded yet" });

    shipment.status = "ai_analyzing";
    shipment.statusHistory.push({
      status: "ai_analyzing",
      message: "AI analysis started by forwarder",
    });
    await shipment.save();

    res.json({ message: "AI analysis started...", shipmentId: shipment._id });

    // Run AI in background
    runAIInBackground(shipment, io, req.app.get("emitToForwarder"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function runAIInBackground(shipment, io, emitToForwarder) {
  const sid = shipment._id.toString();
  console.log("🚀 [AI-START] Background AI analysis started for shipment:", sid);
  console.log("📦 [SHIPMENT-INFO] Product:", shipment.product, "| Route:", shipment.origin, "→", shipment.destination);
  console.log("📄 [DOCUMENTS] Found", shipment.documents?.length || 0, "documents");
  
  try {
    io.to(sid).emit("status", {
      status: "ai_analyzing",
      message: "AI reading documents from Cloudinary...",
    });

    // Download PDFs from Cloudinary and parse text
    const parsedTexts = [];
    console.log("📥 [DOWNLOAD] Starting to download and parse documents...");
    
    for (const doc of shipment.documents) {
      try {
        console.log(`  📝 Processing: ${doc.originalName} (${doc.type})`);
        if (
          doc.cloudinaryUrl &&
          doc.originalName?.toLowerCase().endsWith(".pdf")
        ) {
          console.log(`    🔗 URL: ${doc.cloudinaryUrl.substring(0, 60)}...`);
          const response = await axios.get(doc.cloudinaryUrl, {
            responseType: "arraybuffer",
          });
          const buffer = Buffer.from(response.data);
          const data = await pdfParse(buffer);
          console.log(`    ✅ Parsed ${data.text.length} characters`);
          parsedTexts.push({
            name: doc.originalName,
            type: doc.type,
            text: data.text,
          });
        } else {
          console.log(`    ⚠️ Skipped (not PDF or no URL)`);
          parsedTexts.push({
            name: doc.originalName,
            type: doc.type,
            text: "",
          });
        }
      } catch (err) {
        console.log(`    ❌ Error: ${err.message}`);
        parsedTexts.push({ name: doc.originalName, type: doc.type, text: "" });
      }
    }

    console.log("✅ [DOCUMENTS-PARSED] Total documents parsed:", parsedTexts.length);

    io.to(sid).emit("status", {
      status: "ai_analyzing",
      message: "Running compliance check...",
    });

    console.log("🔍 [GROQ-CALL-START] About to call GROQ API...");
    console.log("   API_KEY exists:", !!process.env.GROQ_API_KEY);
    console.log("   API_KEY length:", process.env.GROQ_API_KEY?.length || 0);
    console.log("   API_KEY starts with:", process.env.GROQ_API_KEY?.substring(0, 10));
    
    const report = await runFullAIAnalysis(parsedTexts, {
      product: shipment.product,
      origin: shipment.origin,
      destination: shipment.destination,
      cargoType: shipment.cargoType,
      exporterName: shipment.exporterName,
      exporterCompany: shipment.exporterDetails?.company,
    });
    
    console.log("✅ [GROQ-SUCCESS] API returned report");
    console.log("   Score:", report?.score);
    console.log("   Risk:", report?.riskLevel);
    console.log("   Status:", report?.status);
    console.log("   Issues found:", report?.issues?.length || 0);

    shipment.complianceReport = { ...report, generatedAt: new Date() };

    // Generate PDF report
    const pdfPath = await generatePDFReport(shipment);
    shipment.pdfReportPath = pdfPath;

    // ✅ Status: awaiting_review — forwarder review karega PEHLE
    shipment.status = "awaiting_review";
    shipment.statusHistory.push({
      status: "awaiting_review",
      message: `AI done. Score: ${report.score}/100. Awaiting forwarder review.`,
    });
    await shipment.save();

    io.to(sid).emit("status", {
      status: "awaiting_review",
      message: `Analysis complete! Score: ${report.score}/100. Please review before sending email.`,
      report,
    });

    const notif = await Notification.create({
      forwarderId: shipment.forwarderId,
      shipmentId: shipment._id,
      type: "ai_done",
      message: `✅ AI Analysis done for "${shipment.product}" — Score: ${report.score}/100 | ${report.riskLevel?.toUpperCase()} RISK. Review & send.`,
    });
    emitToForwarder(shipment.forwarderId.toString(), "new-notification", {
      notification: notif,
      shipmentId: shipment._id,
    });
  } catch (err) {
    console.error("❌ [AI-ERROR] Background AI failed");
    console.error("   Message:", err.message);
    console.error("   Error type:", err.constructor.name);
    if (err.response) {
      console.error("   HTTP Status:", err.response.status);
      console.error("   Response data:", err.response.data);
    }
    console.error("   Full stack:", err.stack);
    
    io.to(sid).emit("status", {
      status: "error",
      message: `AI analysis failed: ${err.message}`,
    });
  }
}

// ✅ Forwarder reviews and approves report before email
exports.approveReport = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.complianceReport?.score)
      return res
        .status(400)
        .json({ error: "No compliance report. Run analysis first." });
    if (shipment.status !== "awaiting_review")
      return res.status(400).json({ error: "Report not pending review." });

    shipment.status = "compliance_done";
    shipment.complianceReport.reviewedAt = new Date();
    shipment.statusHistory.push({
      status: "compliance_done",
      message: "Report reviewed and approved by forwarder.",
    });
    await shipment.save();

    res.json({
      message: "Report approved! Now generate email and send.",
      shipment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate email draft
exports.generateEmail = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.complianceReport)
      return res.status(400).json({ error: "Run compliance analysis first" });
    if (shipment.status === "awaiting_review")
      return res
        .status(400)
        .json({
          error: "Please approve the report first before generating email.",
        });

    const draft = await generateEmailDraft(shipment);
    shipment.emailDraft = { subject: draft.subject, body: draft.body };
    await shipment.save();
    res.json({ message: "Email draft generated", shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate / Regenerate PDF
exports.generatePDF = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.complianceReport)
      return res.status(400).json({ error: "Run compliance first" });

    const filePath = await generatePDFReport(shipment);
    shipment.pdfReportPath = filePath;
    await shipment.save();
    res.json({ message: "PDF generated", pdfPath: filePath, shipment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Preview PDF in browser (inline)
exports.previewPDF = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });

    let filePath = shipment.pdfReportPath;

    // Agar PDF nahi bana hai to abhi banao
    if (
      !filePath ||
      !fs.existsSync(
        path.isAbsolute(filePath)
          ? filePath
          : path.join(process.cwd(), filePath),
      )
    ) {
      if (!shipment.complianceReport)
        return res
          .status(400)
          .json({ error: "Run compliance analysis first to generate PDF." });
      filePath = await generatePDFReport(shipment);
      shipment.pdfReportPath = filePath;
      await shipment.save();
    }

    const absPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="report-${shipment.shipmentId}.pdf"`,
    );
    fs.createReadStream(absPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Download PDF
exports.downloadPDF = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      forwarderId: req.user._id,
    });
    if (!shipment) return res.status(404).json({ error: "Not found" });
    if (!shipment.pdfReportPath)
      return res.status(404).json({ error: "PDF not generated yet." });

    const absPath = path.isAbsolute(shipment.pdfReportPath)
      ? shipment.pdfReportPath
      : path.join(process.cwd(), shipment.pdfReportPath);

    if (!fs.existsSync(absPath))
      return res
        .status(404)
        .json({ error: "PDF file missing. Please regenerate." });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="report-${shipment.shipmentId}.pdf"`,
    );
    fs.createReadStream(absPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
