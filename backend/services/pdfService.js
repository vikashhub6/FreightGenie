const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generatePDFReport(shipment) {
  return new Promise((resolve, reject) => {
    const dir = path.join(__dirname, "../reports");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `report-${shipment.shipmentId}.pdf`);
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const r = shipment.complianceReport;
    const scoreColor = r.score >= 70 ? "#16a34a" : r.score >= 50 ? "#d97706" : "#dc2626";

    // Header
    doc.fontSize(22).fillColor("#1e40af").text("FreightGenie Compliance Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#64748b").text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown();

    // Shipment info
    doc.fontSize(14).fillColor("#1e293b").text("Shipment Details");
    doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`Shipment ID: ${shipment.shipmentId}`);
    doc.text(`Product: ${shipment.product}`);
    doc.text(`Route: ${shipment.origin} → ${shipment.destination}`);
    doc.text(`Exporter: ${shipment.exporterName || shipment.exporterEmail}`);
    doc.moveDown();

    // Score
    doc.fontSize(14).fillColor("#1e293b").text("Compliance Score");
    doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.3);
    doc.fontSize(32).fillColor(scoreColor).text(`${r.score}/100`, { align: "center" });
    doc.fontSize(12).fillColor("#64748b").text(`Risk Level: ${r.riskLevel?.toUpperCase()}`, { align: "center" });
    doc.moveDown();

    // Missing docs
    if (r.missingDocs?.length) {
      doc.fontSize(14).fillColor("#dc2626").text("Missing Documents");
      doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#fca5a5").stroke();
      doc.moveDown(0.3);
      r.missingDocs.forEach((d) => doc.fontSize(11).fillColor("#991b1b").text(`• ${d}`));
      doc.moveDown();
    }

    // Checklist
    doc.fontSize(14).fillColor("#1e293b").text("Compliance Checklist");
    doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.3);
    r.checklist?.forEach((item) => {
      const icon = item.status === "ok" ? "✓" : item.status === "warning" ? "⚠" : "✗";
      const color = item.status === "ok" ? "#16a34a" : item.status === "warning" ? "#d97706" : "#dc2626";
      doc.fontSize(10).fillColor(color).text(`${icon} [${item.assignedTo}] ${item.task}`);
    });
    doc.moveDown();

    // Cost
    doc.fontSize(14).fillColor("#1e293b").text("Cost Estimation");
    doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#e2e8f0").stroke();
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#334155");
    doc.text(`HS Code: ${r.hsCode || "TBD"}`);
    doc.text(`Freight Cost: ${r.freightCost || "TBD"}`);
    doc.text(`Duty Estimate: ${r.dutyEstimate || "TBD"}`);
    doc.text(`Total Landed Cost: ${r.totalCost || "TBD"}`);
    doc.moveDown();

    // Issues & Suggestions
    if (r.issues?.length) {
      doc.fontSize(14).fillColor("#dc2626").text("Issues");
      doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#e2e8f0").stroke();
      doc.moveDown(0.3);
      r.issues.forEach((i) => doc.fontSize(10).fillColor("#7f1d1d").text(`• ${i}`));
      doc.moveDown();
    }
    if (r.suggestions?.length) {
      doc.fontSize(14).fillColor("#16a34a").text("Recommendations");
      doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor("#e2e8f0").stroke();
      doc.moveDown(0.3);
      r.suggestions.forEach((s) => doc.fontSize(10).fillColor("#14532d").text(`• ${s}`));
    }

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

module.exports = { generatePDFReport };
